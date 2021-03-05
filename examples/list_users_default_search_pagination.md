# Full example with default search and pagination

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import { Route, BrowserRouter } from 'react-router-dom'
import axios from 'axios'

export default class App extends React.Component {
    render() {
        return <BrowserRouter>
            <Route exact path='/' component={ListUsers}></Route>
        </BrowserRouter>
    }
}

class ListUsers extends React.Component {
    columns = [
        {
            title: 'User Id',
            dataIndex: 'login'
        }
    ]
    
    render() {
        return <div style={{ padding: "20px" }}>
            <ItemsList
                tableTitle="Search GitHub Users"
                itemsListMethod={this.getItems}
                columns={this.columns}
                history={this.props.history}
                pagination
            />
        </div>
    }

    getItems = (search, page, pageSize) => {
        if (!search) {
            search = 'test'
        }
        console.log('get items', search, page, pageSize)
        return axios.get(`https://api.github.com/search/users?q=${search}&page=${page}&per_page=${pageSize}`)
    }
}
```