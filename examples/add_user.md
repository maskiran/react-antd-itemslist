# Add / Edit User

* Provide a prop `editor={EditorComponentName}`
* Editor component is a passed a prop `editorMode=add` or `editorMode=edit` to let it know if it was called to add or edit
* If editor mode is **edit** another prop `editorValues={valuesObject}` is passed with the current values of the record 
* Editor component must take care of showing or hiding fields depending on a field is editable or not
* The component is provided a function via prop `onSubmit={callMeWhenUserSubmits}`. Once the user submits a form, it must validate and then call `this.props.onSubmit(formValuesObject)`.
* Editor **Need Not** implement the submit button. A submit button is added by parent component and linked to the form. To be able to connect the external submit button with the form, the form MUST be called **editor-form**
* If `itemsListUrl` is provided, then `axios.post(itemsListUrl, formValuesObject)` is called
* A custom add function can be provided with prop `itemAddMethod={customAddFunction}`. Function is called as `customAddFunction(formValuesObject)`. It must return a promise.

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import axios from 'axios'
import {Form, Input} from 'antd'

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

const UserEditor = (props) => {
    return <Form layout="vertical" onFinish={props.onSubmit} name="editor-form">
        <Form.Item label="Username (Login)" name="login">
            <Input placeholder="username"/>
        </Form.Item>
        <Form.Item label="Email Address" name="email">
            <Input placeholder="someone@somewhere.com"/>
        </Form.Item>
    </Form>
}

export default class App extends React.Component {
    render() {
        return <ItemsList
            itemsListUrl="https://api.github.com/users"
            columns={cols}
            dataKey="login"
            indexColViewLink
            editor={UserEditor}
        />
    }
}
```