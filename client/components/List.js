import React from 'react';
import { Grid, Row, Col, Table } from 'react-bootstrap';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            statuses: []
        };
    }

    componentDidMount() {
        fetch('http://localhost:3000/api/statuses/list').then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then((data) => {
            this.setState(data);
        }).catch((e) => {
            console.error(e);
        });
    }

    render () {
        return (
            <Grid>
                <Row>
                    <Col xs={12} md={12}>
                        <Table responsive striped hover>
                            <thead>
                                <tr>
                                    <th>日付</th>
                                    <th>時間帯</th>
                                    <th>施設名</th>
                                    <th>設備名</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.statuses.map((status, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{status.date}</td>
                                            <td>{status.frame}</td>
                                            <td>{status.name}</td>
                                            <td>{status.property}</td>
                                        </tr>
                                    );
                                })
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Grid>
        );
    }
}