# List Users - Custom Pagination Handler

Search github users e.g. https://api.github.com/search/users?q=test&page=1&per_page=20

1. Save the search value in a state
1. Provide a prop `page` and `pageSize` pointing to your state variable
1. Provide a prop `onPagerChange` to a function that is called with the new page and pageSize values
1. Update the state, which triggers a render of your component
1. Provide a prop `reloadKey` equal to the page and pageSize to let the `ItemsList` component know that once there is a change in the reload key it should make a call to `itemsListMethod`
1. Optionally you can change URLs in your own way if required (e.g. update the url to `https://www.myapp.com/page/pageValue/pageSize/pageSiszeValue`)

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
    state = {
        searchValue: "test",
        page: 1,
        pageSize: 25
    }
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
                searchValue={this.state.searchValue}
                onSearchChange={this.handleSearch}
                page={this.state.page}
                pageSize={this.state.pageSize}
                onPagerChange={this.handlePager}
                reloadKey={`${this.state.searchValue}-${this.state.page}-${this.state.pageSize}`}
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

    handleSearch = (searchValue) => {
        this.setState({searchValue: searchValue})
        // this.props.history.push(`/search/${searchValue}/page/${this.state.page}/pageSize/${this.state.pageSize}`)
    }
    
    handlePager = (page, pageSize) => {
        this.setState({page: page, pageSize: pageSize})
        // this.props.history.push(`/search/${this.state.searchValue}/page/${page}/pageSize/${pageSize}`)
    }
}
```

You can use custom routes to maintain the state across browser reloads. For example

1. Add a Route with `/search/:search/page/:page/pageSize/:pageSize`
1. In the `handleSearch` and `handlePager` push a new URL using (props.history.push) the search value, page and pageSize values
1. In the `ItemsList` component read from the URL

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
            <Route exact path='/search/:search/page/:page/pageSize/:pageSize' component={ListUsers}></Route>
        </BrowserRouter>
    }
}

class ListUsers extends React.Component {
    page = 1
    pageSize = 25
    searchValue = "test"
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
                pagination
                searchValue={this.props.match.params.search || this.searchValue}
                onSearchChange={this.handleSearch}
                page={this.props.match.params.page || this.page}
                pageSize={this.props.match.params.pageSize || this.pageSize} 
                onPagerChange={this.handlePager}
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

    handleSearch = (searchValue) => {
        this.searchValue = searchValue
        // reset page on a new search
        this.page = 1
        this.props.history.push(`/search/${searchValue}/page/${this.page}/pageSize/${this.pageSize}`)
    }
    
    handlePager = (page, pageSize) => {
        this.page = page
        this.pageSize = pageSize
        this.props.history.push(`/search/${this.searchValue}/page/${page}/pageSize/${pageSize}`)
    }
}
```