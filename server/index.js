import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { getPriceByArea } from "./routes/priceByArea.js";
import { getPriceTrends } from "./routes/priceTrends.js";
import { getPriceByPropertyType } from "./routes/priceByPropertyType.js";
import { getMarketVolume } from "./routes/marketVolume.js";
import { getPropertyUsageDistribution } from "./routes/propertyUsageDistribution.js";
import { getPropertyTypeDistribution } from "./routes/propertyTypeDistribution.js";
import { getTopAreasPropertyTypeDistribution } from "./routes/topAreasPropertyTypeDistribution.js";
import { getAreaPricePopularity } from "./routes/areaPricePopularity.js";
import { getRoomTypes } from "./routes/roomTypes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Get unique property usage values
app.get("/api/property-usage", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT property_usage_en 
      FROM real_estate 
      WHERE property_usage_en IS NOT NULL AND property_usage_en != ''
      ORDER BY property_usage_en ASC
    `);
    const propertyUsages = rows.map(row => row.property_usage_en);
    res.json(propertyUsages);
  } catch (err) {
    console.error("Error in /api/property-usage:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Price by Area API Route
app.get("/api/price-by-area", async (req, res) => {
  try {
    const propertyUsage = req.query.propertyUsage || null; // 'Residential' or 'Land'
    const areaData = await getPriceByArea(db, propertyUsage);
    res.json(areaData);
  } catch (err) {
    console.error("Error in /api/price-by-area:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Price Trends Over Time API Route
app.get("/api/price-trends", async (req, res) => {
  try {
    const period = req.query.period || 'yearly'; // 'yearly' or 'monthly'
    const trendsData = await getPriceTrends(db, period);
    res.json(trendsData);
  } catch (err) {
    console.error("Error in /api/price-trends:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Price by Property Type API Route
app.get("/api/price-by-property-type", async (req, res) => {
  try {
    const propertyTypeData = await getPriceByPropertyType(db);
    res.json(propertyTypeData);
  } catch (err) {
    console.error("Error in /api/price-by-property-type:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Market Volume by Year API Route
app.get("/api/market-volume", async (req, res) => {
  try {
    const volumeData = await getMarketVolume(db);
    res.json(volumeData);
  } catch (err) {
    console.error("Error in /api/market-volume:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Property Usage Distribution API Route
app.get("/api/property-usage-distribution", async (req, res) => {
  try {
    const distributionData = await getPropertyUsageDistribution(db);
    res.json(distributionData);
  } catch (err) {
    console.error("Error in /api/property-usage-distribution:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Property Type Distribution per Area API Route
app.get("/api/property-type-distribution", async (req, res) => {
  try {
    const distributionData = await getPropertyTypeDistribution(db);
    res.json(distributionData);
  } catch (err) {
    console.error("Error in /api/property-type-distribution:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Top 10 Areas by Total Transactions - Property Type Distribution API Route
app.get("/api/top-areas-property-type-distribution", async (req, res) => {
  try {
    const distributionData = await getTopAreasPropertyTypeDistribution(db);
    res.json(distributionData);
  } catch (err) {
    console.error("Error in /api/top-areas-property-type-distribution:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Area Price and Popularity (Bubble Chart) API Route
app.get("/api/area-price-popularity", async (req, res) => {
  try {
    const bubbleData = await getAreaPricePopularity(db);
    res.json(bubbleData);
  } catch (err) {
    console.error("Error in /api/area-price-popularity:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Most Common Room Types API Route
app.get("/api/room-types", async (req, res) => {
  try {
    const roomTypesData = await getRoomTypes(db);
    res.json(roomTypesData);
  } catch (err) {
    console.error("Error in /api/room-types:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

app.listen(3050, () => console.log("Backend running on port http://localhost:3050"));