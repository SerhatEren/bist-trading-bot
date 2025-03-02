import '../styles/Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} BIST Trading Bot</p>
        <p>Disclaimer: This application is for informational purposes only. Not financial advice.</p>
      </div>
    </footer>
  )
}

export default Footer 