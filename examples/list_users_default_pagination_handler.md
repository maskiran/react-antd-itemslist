# List Users

1. Add `pagination` prop to enable pagination
1. Fetch data from an API that returns a smaller set of a big data. e.g. https://api.github.com/search/users?q=test, that returns `total_count` and a subset of list data

## Sample Data

`total_count` is also a valid attribute instead of `count` for the response data of the API

```
{
  "total_count": 76520,
  "items": [
    {
      "login": "test",
      "id": 383316,
      "html_url": "https://github.com/test",
    },
    {
      "login": "astaxie",
      "id": 233907,
      "html_url": "https://github.com/astaxie",
    }
]
```

## Example

1. Change the App to render a route and the route renders the ItemsList of users
1. Send the `history` prop of the route to the ItemsList so it can change the URL by doing a history push
1. Add a `defaultPageSize` or the component defaults to 25
1. Change `itemsListMethod` to get data as required

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
                defaultPageSize={30}
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

When you navigate through pages look at the browser URL

1. Component updates the browser URL
1. The route triggers a rerender of the ListUsers component which rerenders ItemsList
1. ItemsList goes through normal rendering and there are no changes at this point
1. In the `componentUpdate` it checks that the URL changed compared to the previous URL and triggers a reload of the data
1. The `getItems` method is called with the new page
1. Same steps repeat when you change the page size

To change the borwser URL's attributes for page and page size use the following props

* `pageUrlParameter` defaults to *page*
* `pageSizeUrlParamters` defaults to *page_size*

```
<ItemsList
    tableTitle="Search GitHub Users"
    itemsListMethod={this.getItems}
    columns={this.columns}
    history={this.props.history}
    pagination
    defaultPageSize={30}
    pageUrlParameter="page_number"
    pageSizeUrlParameter="limit"
/>
```