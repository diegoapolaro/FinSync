import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(error) {
    return { erro: error };
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-container-high p-4">
          <div className="bg-paper border-2 border-error p-6 max-w-md w-full text-center">
            <span className="material-symbols-outlined text-error text-5xl block mb-4">error</span>
            <h1 className="font-headline-md text-headline-md text-error uppercase mb-2">
              Algo deu errado
            </h1>
            <p className="font-body-md text-body-md text-on-surface mb-4">
              {this.state.erro.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ erro: null });
                window.location.href = '/';
              }}
              className="border-2 border-primary bg-primary text-on-primary px-6 py-3 uppercase font-label-caps text-label-caps hover:bg-ink transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
