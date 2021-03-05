# react-antd-itemslist

react and antd based component:

* show a list of objects as a table
* Add buttons to add, delete items
* Reload and search table
* Pagination
* Add, Edit, Delete using standard methods (axios.get, axios.put, axios.post, axios.delete) on a base URL + item key
* List items using standard method (axios.get) on a list URL
* Custom methods support for each of the above actions
* Editor hookups to add/edit item

## Dependencies and Peer Dependencies

`reactjs` and `antd` are assumed to be used by the parent app with appropriate css (e.g antd/dist/antd.css) already loaded by your app

## Install

```bash
npm install --save react-antd-itemslist
```

## Import Component

```
import ItemsList from 'react-antd-itemslist';
```

## Usage

```jsx
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'

export default class App extends React.Component {
    columns = [
        {
            title: 'User Id',
            dataIndex: 'login'
        }
    ]
    render() {
        return <ItemsList
            itemsListUrl="https://api.github.com/users"
            columns={this.columns}
        />
    }
}
```

Look at [Examples](examples/README.md) for more options

Here is a link to the [codesandbox](https://codesandbox.io/s/react-antd-itemslist-y5cbp-y5cbp)

## Properties

| Name | Description |
| - | - |
| tableTitle | Title for the table. String or a ReactNode |
| tableTitleIcon | Icon before the title. Default shows a list icon. false/null hides the icon. Icon must be a ReactNode. eg. `<DashboardOutlined />`. Instead of an Icon, you can provide any valid ReactNode |
| tableTitleStyle | Custom CSS Style object to apply for the title |
| tableActions | "default", false or a ReactNode. "default" shows Add, Delete, Reload buttons on the left and a search bar on the right (all these elements are customizable). false does not render the buttons and the search |
| actionButtonsSpan | Number of antd columns to span for the left section (buttons), default 8. 0 hides the action buttons |
| searchSpan | Number of antd columns to span for the left section (buttons), default 16. 0 hides the search bar |
| addButtonTitle | string or ReactNode or false. Default is "Add". Empty string just shows the icon |
| addButtonAction | Function to call on clicking the button. Default shows the editor used to add an item - editor component is supplied as a prop (explained later in this document) |
| deleteButtonTitle | string or ReactNode or false. Default is "Delete". Empty string just shows the icon |
| reloadButtonTitle | string or ReactNode or false. Default is "Reload". Empty string just shows the icon |
| itemsListUrl | URL that returns a list of objects. You can skip this and provide a custom method  (explained later) to get the list of items. The component calls `axios.get(this.props.itemsListUrl)`. [Check this section](#structure-of-list-items) for the expected format of the output |
| itemBaseUrl | Base URL used for edit (put), delete methods. The url is suffixed with the id of the item and does a `axios.delete(this.props.itemBaseUrl + '/' + item[this.props.dataKey])`. You can skip this and provide a custom methods to handle edits and delete |
| itemsListMethod | Function to call to get the list of items. The function should return a promise and must resolve with 'data' attribute to get the response similar to `axios.get` |
| itemGetMethod | Custom function called to get a single item (when the user views a specific record). The function is called with the table row object. Default `axios.get(this.props.itemBaseUrl + '/' + item[this.props.dataKey])` or `customFuction(record)`. The function must return a promise that resolves with 'data' attribute to get the resposne, similar to `axios.get` |
| itemAddMethod | Custom function called to add a new record. An editor (explained below) can be provided for the user to enter the details of a new item to add. Once the user clicks to add, the itemAddMethod is called with the values in the editor form. Defaults to `axios.post(this.props.itemsListUrl, formValues)` or `customFunction(formValues)` |
| itemDeleteMethod | Custom function called to delete a record. Defaults to `axios.delete(this.props.itemBaseUrl + '/' + item(this.props.dataKey])` or `customFunction(record)` |
| itemsDeleteMethod | Custom function called to delete multiple records. Defaults to deleting each record individually using the `itemDeleteMethod` or `customFunction(listOfrecords)` |
| reformatListMethod | Function called after a call to itemsListMethod. You can customize the data and return the object or array of items as required by the component. The data returned must be an array or an object. Check `itemsListMethod` |
| dataKey | The key or the unique id of each item in the array of data objects. Defaults to **id** |
| columns | This is the [antd columns](https://ant.design/components/table/#Column) object. Its a list of objects used to display the table. [Check Columns](#columns) for more details |
| indexCol | Show serial number (index) for each row. true/false. Defaults to true (show the number for each row) |
| indexColViewLink | Make the indexCol clickable so it shows the details, like `viewItemLink` above |
| rowActions | An array of actions to show at each row. The valid values in the array are `['deleteItem', 'editItem']` |
| pagination | true/false. Defaults to false. Show the pagination. It requires the list method to return the data as object with appropriate count, page and page_size attributes |
| rowSelection | true/false. Defaults to true. Show a checkbox at each row so that multiple items can be deleted |
| itemViewerView | "drawer" or "modal". Defaults to "drawer". Show the details of the item in this view |
| itemViewerWidth | Width in percentage for the drawer or the modal. Defaults to "50%" |
| itemViewer | Custom function that's called with the itemDetails record and must return a ReactNode to display. Default shows the table columns data in a columnar table |
| itemViewerTitle | Function called to return a title (ReactNode) for the viewer. Defaults to "Details of $rowIndex - $record[this.props.dataKey] |
| itemViewerEditLink | true/false. Show an "Edit" button in the viewer |
| editorView | "drawer" or "modal". Defaults to "drawer". Show the details of the item in this view |
| editorWidth | Width in percentage for the drawer or the modal. Defaults to "50%" |
| editorAddModeTitle | Title to show in the editor view when adding a new item. Defaults to "Add" |
| editorEditModeTitle | Title to show in the editor view when editing an existing item. Defaults to "Edit" |
| editor | Editor component name. [Check the requirements for the editor component](#editor) |
| editorAddModeOkButtonTitle | OK Button Title of the Editor in Add mode. Defaults to "Add" |
| editorAddModeCancelButtonTitle | Cancel Title of the Editor in Add mode. Defaults to "Cancel" |
| editorEditModeOkButtonTitle | OK Button Title of the Editor in Edit mode. Defaults to "Save" |
| editorEditModeCancelButtonTitle | Cancel Title of the Editor in Edit mode. Defaults to "Cancel" |
| editorProps | Object that's passed as props to the editor |
| onSearchChange | Function to call when the user searches. Function is called with the search value entered. Defaults to changing the URL by adding an argument defined in `searchUrlParameter`. Default handler needs access to `history` attribute from the route (react-router-dom) |
| searchUrlParameter | If `onSearchChange` is not defined, the default behaviour on search is to change the URL by adding an argument with name defined here. Defaults to "search". E.g https//www.myapp.com?search=search-value |
| onPagerChange | Function to call when the user changes the page or the page size. `function(page, pageSize)`. Defaults to changing the URL by adding arguments `pageUrlParameter`=page&`pageSizeUrlParameter`=pageSize. The URL parameters default to "page" and "page_size". Default handler needs access to `history` attribute from the route (react-router-dom)  |
| pageUrlParameter | For the default pagination handler that updates the URL, use this as the parameter name, defaults to "page" |
| pageSizeUrlParameter | For the default pagination handler that updates the URL, use this as the parameter name, defaults to "page_size" |
| reloadKey | Used by the component to check if it needs to do a call to get the list of items. By default it checks the URL and compares with the previous URL and it they are not same, reloads the list of items. This should be sufficient to handle reloads in case of changes. However if the component is embedded in other pages where the URL is not changed, then provide a value here that helps the component to trigger a reload |

## Structure of List Items

If you use custom `itemsListMethod` with `reformatListMethod` or the default `axios.get(this.props.itemsListUrl)` the calls must return either a list of objects or an object with the following keys:

- `items` - [array of data objects]
- `count` - Total number of items available. If you are using pagination, this can be the total count of items in the database (e.g 100000). If this is not provided, defaults to the length of the array 

## Columns

The definition of columns is as follows:

```js
[
    {
        title: 'Column 1',
        dataIndex: 'data attribute of the object in the list'
    },
    {
        title: 'Column 2',
        dataIndex: 'data attribute of the object in the list',
        render: (colData, record, colIndex) => {
            return customRenderer
        }
    }
]
```

On top of the [antd column](https://ant.design/components/table/#Column) definition, you can add another attribute called `viewItemLink: true` on a column, and it makes this column clickable to view the details of the item

```
{
    title: 'ViewDetails Column',
    dataIndex: 'idField',
    viewItemLink: true
}
```

## Editor

* Editor must have a form with name as "editor-form"
* Editor is passed `editorMode="add"` or `editorMode="edit"` to inform if its in add/edit mode
* Editor is passed `editorValues={valuesObject}` with values of the current record (in edit mode) and must take decisions on whether to show a field or not in edit mode
* Editor must call this.props.onSubmit(valuesObject) in `onFinish` handler.

[Look at the example](examples/add_user.md) for a sample of the editor component