# List Users - Search

Search github users e.g. https://api.github.com/search/users?q=test

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
            />
        </div>
    }

    getItems = (search, page, pageSize) => {
        if (!search) {
            search = 'test'
        }
        console.log('get items', search)
        return axios.get(`https://api.github.com/search/users?q=${search}`)
    }
}
```

When you navigate through pages look at the browser URL

1. Component updates the browser URL
1. The route triggers a rerender of the ListUsers component which rerenders ItemsList
1. ItemsList goes through normal rendering and there are no changes at this point
1. In the `componentUpdate` it checks that the URL changed compared to the previous URL and triggers a reload of the data
1. The `getItems` method is called with the new page
1. Same steps repeat when you change the page size

To change the borwser URL's attributes for search use the following props

* `searchUrlParameter` defaults to *search*

```
<ItemsList
    tableTitle="Search GitHub Users"
    itemsListMethod={this.getItems}
    columns={this.columns}
    history={this.props.history}
    searchUrlParameter="query"
/>
```