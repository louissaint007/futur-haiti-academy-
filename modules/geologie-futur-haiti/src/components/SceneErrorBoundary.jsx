import { Component } from 'react';

export default class SceneErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return <div className="scene-error" role="alert">
      <strong>La scène 3D n’a pas pu se charger.</strong>
      <span>Recharge la page pour réessayer.</span>
    </div>;
  }
}
