import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default class Header extends React.Component {
    render() {
        return (
            <Navbar inverse>
                <Navbar.Header>
                    <Navbar.Brand>
                        施設横断検索
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <LinkContainer to='/list/date'>
                        <NavItem>空き状況一覧（日付別）</NavItem>
                    </LinkContainer>
                    <LinkContainer to='/list/facility'>
                        <NavItem>空き状況一覧（施設別）</NavItem>
                    </LinkContainer>
                </Nav>
            </Navbar>
        );
    }
}