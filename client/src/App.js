import PriceByArea from './components/PriceByArea';
import PriceTrends from './components/PriceTrends';
import PriceByPropertyType from './components/PriceByPropertyType';
import MarketVolume from './components/MarketVolume';
import PropertyUsageDistribution from './components/PropertyUsageDistribution';
import './App.css';

function App() {
  return (
    <div className="App">
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Dubai Real Estate Dashboard
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Price by Property Type */}
          <PriceByPropertyType />

          {/* Property Usage Distribution */}
          <PropertyUsageDistribution />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Price Trends Over Time */}
          <PriceTrends />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Market Volume by Year */}
          <MarketVolume />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Price by Area with Property Usage dropdown */}
          <PriceByArea />
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '60px',
          padding: '50px 30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(30px)'
          }} />
          
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Course Information */}
            <div style={{
              textAlign: 'center',
              marginBottom: '45px',
              paddingBottom: '30px',
              borderBottom: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px',
                padding: '12px 24px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🎓</span>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  MSc in AI
                </h2>
              </div>
              <p style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: '0.3px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Data Mining
              </p>
            </div>

            {/* Instructor and Students */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px'
            }}>
              {/* Instructor Section */}
              <div style={{
                padding: '30px',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}>
                    👨‍🏫
                  </div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#667eea',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px'
                  }}>
                    Instructor
                  </h3>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#2d3748',
                  lineHeight: '1.4'
                }}>
                  Dr. Shamal Taha
                </p>
              </div>

              {/* Students Section */}
              <div style={{
                padding: '30px',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)'
                  }}>
                    👥
                  </div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#f5576c',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px'
                  }}>
                    Students
                  </h3>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  paddingLeft: '52px'
                }}>
                  {['Dilovan', 'Meetan', 'Farhang', 'Panar', 'Shad'].map((student, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        padding: '10px 18px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#ffffff',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'default',
                        letterSpacing: '0.3px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      {student}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
