import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
          <Card className="p-6 max-w-md w-full text-center border-border/80 shadow-lg rounded-2xl bg-card">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground mb-1">
              Algo deu errado
            </h1>
            <p className="text-xs text-muted-foreground mb-4">
              Ocorreu um erro inesperado ao renderizar esta página.
            </p>
            <div className="text-xs font-mono text-destructive/90 bg-destructive/5 p-3 rounded-xl break-words mb-5 border border-destructive/20 text-left">
              {this.state.erro.message || 'Erro desconhecido'}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => {
                  this.setState({ erro: null });
                  window.location.reload();
                }}
                className="w-full gap-2 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Tentar novamente
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  this.setState({ erro: null });
                  window.location.href = '/';
                }}
                className="w-full gap-2 rounded-xl"
              >
                <Home className="w-4 h-4" />
                Voltar ao início
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

