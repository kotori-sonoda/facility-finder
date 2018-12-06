import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import List from './components/List';
import ListByFacility from './components/ListByFacility';
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
                        <Route path='/list/date' component={List}/>
                        <Route path='/list/facility' component={ListByFacility}/>
                        <Route component={ErrorPage}/>
                    </Switch>
                    <div style={{textAlign: 'center'}}>&copy;2018 浦の星システムエンジニアリング</div>
                </div>
            </BrowserRouter>
        );
    }
}