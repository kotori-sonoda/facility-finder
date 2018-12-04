import React from 'react';
import { Grid, Row, Col, PageHeader } from 'react-bootstrap';

export default class Header extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <Col xs={12} md={12}>
                        <div style={{textAlign: 'center'}}>
                            <PageHeader>にゃーん</PageHeader>
                            <img src="/error.jpg"/>
                        </div>
                    </Col>
                </Row>
            </Grid>
        );
    }
}