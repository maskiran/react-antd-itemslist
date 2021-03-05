# Render User Details - Custom Renderer

When a field is clickable to show the details of the item, the json view of the details is displayed. To display the data in a better way a custom function can be provided.

* Provide prop `itemViewer={customFunction}`. Function is called with the details of the item.
* Function must return a ReactNode

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import axios from 'axios'
import { Descriptions } from 'antd'

const cols = [
    {
        title: 'Login',
        dataIndex: 'login',
    },
    {
        title: 'HTML URL',
        dataIndex: 'html_url'
    }
]

export default class App extends React.Component {
    render() {
        return <ItemsList
            itemsListUrl="https://api.github.com/users"
            columns={cols}
            dataKey="login"
            indexColViewLink
            itemGetMethod={this.getUserDetails}
            itemViewer={this.renderUserDetails}
        />
    }

    getUserDetails = (rowRecord) => {
        return axios.get("https://api.github.com/users/" + rowRecord.login)
    }

    renderUserDetails = (userDetails) => {
        return <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Login">{userDetails.login}</Descriptions.Item>
            <Descriptions.Item label="HTML URL">{userDetails.html_url}</Descriptions.Item>
        </Descriptions>
    }
}
```