import React, { Component } from 'react';
import { DrizzleProvider } from '@drizzle/react-plugin';
import { LoadingContainer } from '@drizzle/react-components';
import drizzleOptions from './drizzleOptions';
import OptimizerFactoryComponent from './OptimizerFactoryComponent';


class App extends Component {
  render() {
    return (
      <DrizzleProvider options={drizzleOptions}>
        <LoadingContainer>
          <OptimizerFactoryComponent />
        </LoadingContainer>
      </DrizzleProvider>

    );
  }
}

export default App;
