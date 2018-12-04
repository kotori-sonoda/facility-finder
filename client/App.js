import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import List from './components/List';
import Header from './components/Header';
import ErrorPage from './components/Error';

export default class App extends React.Component {
    render () {
        return (
            <BrowserRouter>
                <div>
                    <Header/>
                    <Switch>
                        <Route exact path='/' component={List}/>
                        <Route component={ErrorPage}/>
                    </Switch>
                    <div style={{textAlign: 'center'}}>&copy;2018 浦の星システムエンジニアリング</div>
                </div>
            </BrowserRouter>
        );
    }
}