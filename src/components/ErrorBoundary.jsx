import { Component } from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card">
            <h2>Terjadi Kesalahan</h2>
            <p>Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman untuk melanjutkan.</p>
            <button onClick={() => window.location.reload()}>Muat Ulang Halaman</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
