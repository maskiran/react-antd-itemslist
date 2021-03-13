import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReactJson from 'react-json-view';
import {
    Table, Input, Button, Modal, Drawer, Row, Col,
    Typography, Popconfirm, Spin, Alert, message, Space, Descriptions,
    Checkbox,
    notification
} from 'antd';
import {
    ReloadOutlined, PlusOutlined, CopyOutlined, EditOutlined,
    DeleteOutlined, DatabaseOutlined, EnvironmentOutlined, SettingOutlined
} from '@ant-design/icons';
import { getResponseErrorMessage } from './utils';
import _ from 'lodash';
import qs from 'query-string';
import './index.css';

/**
 * @augments {React.Component<Props, State>}
 */
export default class ItemsList extends React.Component {
    constructor(props) {
        super(props)
        /* page, pageSize and search can come from url (default handler) or explicitly
        as props from the parent. So to handle both scenrios store those props in
        another instance variable
        */
        this.searchParams = this.getSearchParams()
        this.url = window.location.href
        this.state = {
            // from prop or url arg, required to show the text input
            searchValue: this.searchParams.searchValue,
            items: {},
            loading: true,
            itemRowIndex: -1,
            itemViewerVisible: false,
            itemViewerTitle: "",
            itemLoading: false,
            itemDetails: null,
            itemViewer: this.props.itemViewer || this.defaultViewer,
            editorVisible: false,
            editorMode: "add", // or edit,
            editorTitle: "",
            editorOkButtonTitle: "",
            editorCancelButtonTitle: "",
            editorError: "",
            columnSelectorVisible: false,
            selectedRows: [],
            columns: this.getTableColumns(),
            dynamicCols: [],
        }
    }

    componentDidMount() {
        this.getItems()
    }

    componentDidUpdate(prevProps) {
        // search params like searchValue, page, pageSize could have changed from the props
        var reloadRequired = false
        if (this.props.reloadKey === "$url") {
            var oldUrl = this.url
            var newUrl = window.location.href
            if (newUrl !== oldUrl) {
                reloadRequired = true
                this.url = newUrl
            }
        } else if (this.props.reloadKey !== prevProps.reloadKey) {
            reloadRequired = true
        }
        if (reloadRequired) {
            this.searchParams = this.getSearchParams()
            this.setState({ searchValue: this.searchParams.searchValue })
            this.getItems()
        }
    }

    getSearchParams = () => {
        // search params are read from the props or the url depending on
        // if custom methods are provided for search and pagination handler
        var searchParams = {}
        if (this.props.onSearchChange) {
            // custom handler provided, so read from the props
            searchParams.searchValue = this.props.searchValue
        } else {
            // default handler, read from the url
            searchParams.searchValue = qs.parse(window.location.search)[this.props.searchUrlParameter] || ""
        }
        if (this.props.onPagerChange) {
            // custom handler provided, so read from the props
            searchParams.page = _.parseInt(this.props.page)
            searchParams.pageSize = _.parseInt(this.props.pageSize || this.props.defaultPageSize)
        } else {
            // default handler read from the url
            var page = qs.parse(window.location.search)[this.props.pageUrlParameter] || 1
            searchParams.page = _.parseInt(page)
            // as an exception, pageSize can be provided by the prop. rest apis
            // might implement their standard page sizes and the parent component would
            // have that info. url overwrites this value
            var pageSize = qs.parse(window.location.search)[this.props.pageSizeUrlParameter]
            if (!pageSize) {
                pageSize = _.get(this.props, 'pageSize', this.props.defaultPageSize)
            }
            searchParams.pageSize = _.parseInt(pageSize)
        }
        return searchParams
    }

    render() {
        return (
            <div>
                {this.renderTableTitle()}
                {this.renderTableActions()}
                {this.renderItemsTable()}
                {this.state.editorVisible && this.renderEditorModal()}
                {this.state.itemViewerVisible && this.renderItemDetails()}
                {this.state.columnSelectorVisible && this.renderColumnSelector()}
            </div>
        )
    }

    renderTableTitle = () => {
        if (!this.props.tableTitle) {
            return
        }
        if (typeof this.props.tableTitle === "string") {
            return <Typography.Title level={5} style={this.props.tableTitleStyle}>
                {this.props.tableTitleIcon} {this.props.tableTitle}
            </Typography.Title>
        } else {
            return <div style={this.props.tableTitleStyle}>{this.props.tableTitle}</div>
        }
    }

    renderTableActions = () => {
        if (this.props.tableActions === 'default') {
            return this.renderDefaultTableActions()
        } else {
            return this.props.tableActions
        }
    }

    renderDefaultTableActions = () => {
        return (
            <Row style={{ marginBottom: "16px" }} align="middle" className="table-actions">
                <Col span={this.props.actionButtonsSpan}>
                    {this.renderDefaultTableActionsButtons()}
                </Col>
                <Col span={this.props.searchSpan}>
                    {this.renderDefaultTableActionsSearch()}
                </Col>
            </Row>
        )
    }

    renderDefaultTableActionsButtons = () => {
        if (this.props.actionButtonsSpan === 0) {
            return null
        }
        return <Row gutter={8} className="table-action-buttons">
            {/* to align from the right style={{ justifyContent: "flex-end", display: "flex" }} */}
            {this.props.addButtonTitle !== false &&
                <Col>
                    <Button type="primary"
                        disabled={!this.props.addButtonAction && !this.props.editor}
                        onClick={this.props.addButtonAction || this.prepareToAddItem}
                        icon={<PlusOutlined />}>
                        {this.props.addButtonTitle}
                    </Button>
                </Col>
            }
            {this.props.deleteButtonTitle !== false &&
                <Col>
                    <Popconfirm
                        title="Delete selected items? "
                        onConfirm={this.deleteSelectedItems}
                        okText="Yes"
                        cancelText="No">
                        <Button type="danger"
                            icon={<DeleteOutlined />}
                            disabled={!this.state.selectedRows.length}>
                            {this.props.deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </Col>
            }
            {this.props.reloadButtonTitle !== false &&
                <Col>
                    <Button
                        onClick={this.getItems} icon={<ReloadOutlined />}>
                        {this.props.reloadButtonTitle}
                    </Button>
                </Col>
            }
        </Row>
    }

    renderDefaultTableActionsSearch = () => {
        if (this.props.searchSpan === 0) {
            return null
        }
        return <Input.Search
            value={this.state.searchValue}
            onSearch={this.handleSearchOnSearch}
            onChange={this.handleSearchOnChange} />
    }

    renderItemsTable = () => {
        var rowSelection = {
            onChange: this.handleRowSelection,
            selectedRowKeys: this.state.selectedRows,
        }
        var pagination = {
            pageSize: this.searchParams.pageSize,
            total: this.state.items.count,
            current: this.searchParams.page,
            onChange: this.handlePagerClick,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: _.sortedUniq(_.sortBy([10, 25, 50, 100, this.props.defaultPageSize])),
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }
        if (!this.props.pagination) {
            pagination = false
        }
        if (!this.props.rowSelection) {
            rowSelection = false
        }
        return (
            <Table dataSource={this.state.items.items}
                columns={this.state.columns} size="small" bordered
                rowSelection={rowSelection}
                {...this.props.tableProps}
                rowKey={this.props.dataKey}
                loading={this.state.loading}
                pagination={pagination}
            />
        )
    }

    renderEditorModal = () => {
        if (this.props.editorView === "drawer") {
            return <Drawer visible={this.state.editorVisible}
                title={this.state.editorTitle}
                width={this.props.editorWidth} onClose={this.hideEditor}
                mask={true} maskClosable={false}
                keyboard={false}
                placement="right" className="drawer"
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={this.hideEditor} style={{ marginRight: 10 }}>
                            {this.state.editorCancelButtonTitle}
                        </Button>
                        {/* trigger submit on a form called "editor-form" that's loaded inside the drawer */}
                        <Button form="editor-form" htmlType="submit" type="primary">
                            {this.state.editorOkButtonTitle}
                        </Button>
                    </div>
                }
            >
                {this.state.editorError &&
                    <Alert message={this.state.editorError} type="error"
                        showIcon closable style={{ marginBottom: "20px" }} />
                }
                {this.state.editorMode === "edit" ?
                    (this.state.itemDetails ? this.getEditor() : <Spin size="large" />)
                    :
                    this.getEditor()
                }

            </Drawer>
        } else {
            return (
                <Modal visible={this.state.editorVisible}
                    title={this.state.editorTitle}
                    width={this.props.editorWidth}
                    mask={true} maskClosable={false}
                    keyboard={false}
                    okText={this.state.editorOkButtonTitle}
                    cancelText={this.state.editorCancelButtonTitle}
                    onCancel={this.hideEditor}
                    okButtonProps={{ form: 'editor-form', key: 'submit', htmlType: 'submit' }}
                >
                    {this.state.editorError &&
                        <Alert message={this.state.editorError} type="error"
                            showIcon closable style={{ marginBottom: "20px" }} />
                    }
                    {this.getEditor()}
                </Modal>
            )
        }
    }

    renderItemDetails = () => {
        var title = this.state.itemViewerTitle;
        var editLink;
        if (this.props.itemViewerEditLink && this.state.itemDetails) {
            editLink = <Button icon={<EditOutlined />} style={{ marginLeft: "15px" }}
                disabled={!this.props.editor}
                type="primary" onClick={this.editItem} size="small">Edit</Button>
        }
        title = <span>{title} {editLink}</span>

        if (this.props.itemViewerView === "drawer") {
            return <Drawer visible={this.state.itemViewerVisible}
                title={title}
                width={this.props.itemViewerWidth}
                onClose={this.hideItemViewer}
                mask={false}
                placement="right"
                className="drawer"
                keyboard={false}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button onClick={this.hideItemViewer}>
                            Cancel
                        </Button>
                    </div>
                }
            >
                {this.state.itemDetails ?
                    this.state.itemViewer(this.state.itemDetails)
                    :
                    <Spin size="large" />
                }
            </Drawer>
        } else {
            return (
                <Modal visible={this.state.itemViewerVisible}
                    title={title}
                    width={this.props.itemViewerWidth}
                    onCancel={this.hideItemViewer}
                    footer={[
                        <Button key="back" onClick={this.hideItemViewer}>
                            Cancel
                        </Button>
                    ]}
                >
                    {this.state.itemDetails ?
                        this.state.itemViewer(this.state.itemDetails)
                        :
                        <Spin size="large" />
                    }
                </Modal>
            )
        }
    }

    renderColumnSelector = () => {
        return <Modal visible={this.state.columnSelectorVisible}
            title="Select Table Columns"
            width="50%"
            onCancel={this.hideColumnSelector}
            footer={
                <div>
                    <Button key="back" onClick={this.hideColumnSelector}>
                        Cancel
                    </Button>
                    <Button onClick={this.selectTableColumns} type="primary">
                        Done
                    </Button>
                </div>
            }
        >
            {this.displayColumnCheckboxes()}
        </Modal>
    }

    displayColumnCheckboxes = () => {
        var colCkBoxes = [];
        var displayableCols = this.props.columns.concat(this.state.dynamicCols)
        displayableCols.forEach((col, idx) => {
            var colLabel = "";
            var tmpCols;
            if (col.children) {
                // a column that has children grouped under a top level title in the table
                // that spans across all the children columns
                tmpCols = col.children.map((item, idx) => {
                    return <Col span={8}>
                        <Checkbox key={idx} defaultChecked={!item.hide}
                            onChange={(val) => item.hide = !val.target.checked}>
                            {item.title}
                        </Checkbox>
                    </Col>
                })
                // colLabel = <span>{col.title} <Checkbox style={{marginLeft: "10px"}} /></span>;
                colLabel = col.title;
                tmpCols = <Row>{tmpCols}</Row>
            } else {
                tmpCols = <Checkbox defaultChecked={!col.hide}
                    onChange={(val) => col.hide = !val.target.checked}>
                    {col.title}
                </Checkbox>
            }
            colCkBoxes.push(<Descriptions.Item label={colLabel} key={idx} >{tmpCols}</Descriptions.Item>)
        })
        return <Descriptions bordered size="small" column={1} className="label-fit">
            {colCkBoxes}
        </Descriptions>
    }

    jsonViewer = (record) => {
        return <ReactJson src={record} enableClipboard={true}
            indentWidth={4} collapseStringsAfterLength={64}
            iconStyle="square" name={false} displayDataTypes={false}
        />;
    }

    defaultViewer = (record) => {
        return this.jsonViewer(record)
    }

    changeItemViewerType = () => {
        if (this.state.itemViewerType === "json") {
            this.setState({
                itemViewerType: "formatted",
                itemViewer: this.props.itemViewer || this.defaultViewer
            })
        } else {
            this.setState({
                itemViewerType: "json",
                itemViewer: this.jsonViewer
            })
        }
    }

    augmentTableColumns = (columns) => {
        // add S.No, Actions col to the columns list
        if (this.props.indexCol) {
            var idxCol = {
                title: 'S.No',
                key: 'idx',
                className: 'td-fit',
                render: (text, record, index) => {
                    return (this.state.items.start_idx + index)
                }
            };
            if (this.props.indexColViewLink) {
                idxCol.viewItemLink = true;
            }
            // add the indexCol as the first column in the table
            columns.unshift(idxCol)
        }
        if (this.props.rowActions) {
            var actionsCol = this.renderRowActions()
            columns.push(actionsCol);
        }
        // in all these columns if there is anything with 'viewItemLink: true', then render that column as link to get/view item
        for (var col of columns) {
            if (col.viewItemLink) {
                col.className += " view-link";
                col.onCell = (record, rowIndex) => {
                    return {
                        onClick: () => {
                            this.prepareToViewItem(record, rowIndex);
                        }
                    }
                }
            }
        }
        return columns
    }

    renderRowActions = () => {
        return {
            title: <SettingOutlined onClick={this.showColumnSelector} />,
            key: 'actions',
            className: 'td-fit td-title-center',
            render: (text, record) => {
                var buttons = this.props.rowActions.map(action => {
                    switch (action) {
                        case "duplicateItem":
                            return <Button type="link" size="small" key={action} icon={<CopyOutlined />}
                                onClick={() => this.duplicateItem(record)} />
                        case "deleteItem":
                            return (
                                <Popconfirm key={action}
                                    title={"Delete?"}
                                    onConfirm={() => this.deleteItem(record)}
                                    okText="Yes"
                                    cancelText="No">
                                    <Button type="link" size="small" icon={<DeleteOutlined />} />
                                </Popconfirm>
                            )
                        case "editItem":
                            return <Button type="link" size="small" key={action} icon={<EditOutlined />}
                                disabled={!this.props.editor}
                                onClick={() => this.prepareToEditItem(record)} />
                        default:
                            return null
                    }
                })
                return <Space>{buttons}</Space>
            }
        }
    }

    getTableColumns = () => {
        // from each prop column, if hide is true remove that column from the display
        var dynamicCols = [];
        // this method is also called from the constructor inside the state setter.
        // during that phase, the state and dynamiccols dont exist. So make an explicit
        // check here
        if (this.state && this.state.dynamicCols) {
            dynamicCols = this.state.dynamicCols
        }
        var tmpCols = _.cloneDeep(this.props.columns.concat(dynamicCols));
        var displayCols = tmpCols.filter(item => {
            if (item.children) {
                // check if any children need to be hidden
                item.children = item.children.filter(childCol => {
                    return !childCol.hide
                })
            }
            return !item.hide
        })
        this.augmentTableColumns(displayCols);
        return displayCols
    }

    selectTableColumns = () => {
        var cols = this.getTableColumns();
        this.setState({
            columns: cols,
            columnSelectorVisible: false
        })
    }

    addDynamicHiddenColumns = (data) => {
        // add tag_keys to colsList as hidden cols
        var dynamicCols = [];
        var dynamicColNamesSet = new Set();
        data.items.forEach(item => {
            if (!item._dynamic_cols) {
                return
            }
            item._dynamic_cols.forEach(dcol => {
                if (dynamicColNamesSet.has(dcol)) {
                    return
                }
                dynamicColNamesSet.add(dcol);
                dynamicCols.push({
                    title: dcol,
                    dataIndex: dcol,
                    hide: true
                })
            })
        })
        this.setState({ dynamicCols: dynamicCols })
    }

    getEditor = () => {
        var ExternalEditor = this.props.editor;
        if (!ExternalEditor) {
            return null;
        }
        return <ExternalEditor editorValues={this.state.itemDetails}
            editorMode={this.state.editorMode}
            onSubmit={this.saveItem}
            {...this.props.editorProps}
        />
    }

    prepareToAddItem = () => {
        this.setState({
            itemDetails: null,
            editorMode: 'add',
            editorTitle: this.props.editorAddModeTitle,
            editorOkButtonTitle: this.props.editorAddModeOkButtonTitle,
            editorCancelButtonTitle: this.props.editorAddModelCancelButtonTitle,
        });
        this.showEditor()
    }

    prepareToEditItem = (record) => {
        // this is called when edit is clicked on the table row.
        // get item details and then call editItem
        this.getItem(record);
        // dont have to wait. the editor is shown with spinner
        this.editItem();
    }

    editItem = () => {
        this.setState({
            editorMode: 'edit',
            editorTitle: this.props.editorEditModeTitle,
            editorOkButtonTitle: this.props.editorEditModeOkButtonTitle,
            editorCancelButtonTitle: this.props.editorEditModeCancelButtonTitle
        });
        this.showEditor()
    }

    /* TODO: fix this */
    duplicateItem = (record) => {
        var keys = this.props.duplicateItemKeys;
        var data = {};
        for (var key of keys) {
            data[key] = record[key]
        }
        this.showEditor();
    }

    saveItem = (data) => {
        var promise;
        var url;
        if (this.state.editorMode === "edit") {
            if (this.props.itemEditMethod) {
                promise = this.props.itemEditMethod(data)
            } else {
                url = this.props.itemBaseUrl + data[this.props.dataKey];
                promise = axios.put(url, data)
            }
        } else {
            if (this.props.itemAddMethod) {
                promise = this.props.itemAddMethod(data)
            } else {
                url = this.props.itemsListUrl;
                promise = axios.post(url, data)
            }
        }
        promise.then((rsp) => {
            this.setState({ editorError: "" })
            this.getItems();
            this.hideEditor();
            message.success('Added / Saved successfully')
        }).catch(err => {
            var errMsg = getResponseErrorMessage(err);
            this.setState({ editorError: errMsg })
        })
    }

    deleteItem = (record, returnPromise = false) => {
        // if record is a single item (with dataKey attribute),
        // then delete the single record
        this.setState({ loading: true })
        var promise;
        if (this.props.itemDeleteMethod) {
            promise = this.props.itemDeleteMethod(record);
        } else {
            var url = this.props.itemBaseUrl + '/' + record[this.props.dataKey];
            promise = axios.delete(url);
        }
        if (returnPromise) {
            return promise;
        }
        promise.then(rsp => {
            this.getItems();
            message.success('Deleted successfully');
        })
    }

    deleteSelectedItems = () => {
        var records = [];
        this.state.selectedRows.map(key => {
            // find the record with the selected key
            for (var item of this.state.items.items) {
                if (item[this.props.dataKey] === key) {
                    records.push(item);
                    break
                }
            }
            return null;
        })
        var promise;
        if (this.props.itemsDeleteMethod) {
            promise = this.props.itemsDeleteMethod(records)
        } else {
            // delete each record individually
            var promises = records.map(record => {
                return this.deleteItem(record, true)
            })
            promise = axios.all(promises);
        }
        promise.then(rsp => {
            this.getItems();
            this.setState({ selectedRows: [] });
            message.success('Deleted successfully');
        })
    }

    getItems = () => {
        this.setState({
            items: [],
            loading: true,
            editorVisible: false,
            itemViewerVisible: false,
        });
        var promise;
        if (this.props.itemsListMethod) {
            promise = this.props.itemsListMethod(this.searchParams.searchValue,
                this.searchParams.page, this.searchParams.pageSize)
        } else {
            var args = {
                [this.props.searchUrlParameter]: this.searchParams.searchValue,
                [this.props.pageUrlParameter]: this.props.pagination && this.searchParams.page,
                [this.props.pageSizeUrlParameter]: this.props.pagination && this.searchParams.pageSize,
            }
            args = _.pickBy(args)
            promise = axios.get(this.props.itemsListUrl, { params: args })
        }

        promise.then((rsp) => {
            var data;
            if (this.props.reformatListDataMethod) {
                // method is supposed to return an object with count: number and items: [list]
                console.log(rsp)
                data = this.props.reformatListDataMethod(rsp.data, rsp.headers)
            } else {
                /* default handler
                if no reformatListDataMethod is defined and the response
                is an array, convert that to a default object instead of forcing
                user to implement a reformatListMethod. This is just a convenience
                */
                if (Array.isArray(rsp.data)) {
                    data = { 'items': rsp.data, count: rsp.data.length }
                } else {
                    data = rsp.data
                    // treat other attributes for total as count
                    if (!('count' in data)) {
                        if ('total' in data) {
                            data.count = data.total
                        } else if ('total_count' in data) {
                            data.count = data.total_count
                        }
                    }
                }
            }
            data.start_idx = (this.searchParams.page - 1) * this.searchParams.pageSize + 1
            this.addDynamicHiddenColumns(data);
            this.setState({
                items: data,
                loading: false,
            });
        }).catch(err => {
            var errMsg = getResponseErrorMessage(err)
            notification.error({ duration: 0, message: errMsg })
            this.setState({
                items: [],
                loading: false
            })
        })
    }

    renderItemViewerTitle = (record, rowIndex) => {
        var title;
        var key = this.props.dataKey;
        if (record.name) {
            key = 'name'
        }
        if (!this.props.itemViewerTitle) {
            title = 'Row ' + (rowIndex + 1) + ' - ' + record[key]
        } else {
            // function defined from the caller
            title = this.props.itemViewerTitle(record, rowIndex)
        }
        return <span>
            <EnvironmentOutlined onClick={this.changeItemViewerType}
                style={{ marginRight: "10px" }} />
                Details of {title}
        </span>
    }

    prepareToViewItem = (record, rowIndex) => {
        this.setState({
            itemRowIndex: rowIndex,
            editorVisible: false,
            itemDetails: null,
            itemViewerType: "formatted",
            itemViewer: this.props.itemViewer || this.defaultViewer,
            itemViewerVisible: true,
            itemViewerTitle: this.renderItemViewerTitle(record, rowIndex),
        });
        var promise = this.getItem(record);
        // getItem would have already set the itemDetails
        promise.then(rsp => {
            this.setState({
                itemLoading: false
            });
        })
    }

    getItem = (record) => {
        this.setState({ itemDetails: null })
        var promise;
        if (this.props.itemGetMethod) {
            promise = this.props.itemGetMethod(record)
        } else {
            var url = this.props.itemBaseUrl + '/' + record[this.props.dataKey];
            promise = axios.get(url);
        }
        return promise.then((rsp) => {
            this.setState({
                itemDetails: rsp.data,
            });
        })
    }

    /* TODO: fix this */
    handlePagerClick = (page, pageSize) => {
        if (this.props.onPagerChange) {
            this.props.onPagerChange(page, pageSize)
        } else {
            /* expected to get props.history and props.location from the parent
            url is updated with values only if its not default, otherwise just null it out.
            the component just changes the url as a default handler. the url change
            would trigger a route change on the parent and this component either gets
            reloaded or would go through render and componentUpdate would pick up the 
            updates and then gets items
            */
            this.changeBrowserUrl({
                [this.props.pageUrlParameter]: page === 1 ? null : page,
                [this.props.pageSizeUrlParameter]: pageSize === this.props.defaultPageSize ? null : pageSize
            })
        }
    }

    /* TODO: fix this */
    handleSearchOnSearch = (val) => {
        if (val === "") val = null;
        if (this.props.onSearchChange) {
            this.props.onSearchChange(val)
        } else {
            /* expected to get props.history and props.location from the parent
            reset page on a new search
            the component just changes the url as a default handler. the url change
            would trigger a route change on the parent and this component either gets
            reloaded or would go through render and componentUpdate would pick up the 
            updates and then gets items
            */
            this.changeBrowserUrl({
                [this.props.searchUrlParameter]: val,
                [this.props.pageUrlParameter]: null,
            })
        }
    }

    handleSearchOnChange = (e) => {
        this.setState({ searchValue: e.target.value })
        if (e.target.value === "") {
            this.handleSearchOnSearch(e.target.value)
        }
    }

    changeBrowserUrl = (argObject) => {
        var urlArgs = qs.parse(window.location.search)
        urlArgs = Object.assign(urlArgs, argObject)
        // remove null values
        var urlArgsStr = qs.stringify(urlArgs, { skipNull: true, skipEmptyString: true })
        this.props.history.push({ search: urlArgsStr })
    }

    handleRowSelection = (selectedKeys, records) => {
        this.setState({ selectedRows: selectedKeys })
    }

    hideItemViewer = () => {
        this.setState({ itemViewerVisible: false })
    }

    showEditor = () => {
        this.setState({
            editorVisible: true,
            itemViewerVisible: false
        })
    }

    hideEditor = () => {
        this.setState({ editorVisible: false })
    }

    showColumnSelector = () => {
        this.setState({ columnSelectorVisible: true })
    }

    hideColumnSelector = () => {
        this.setState({ columnSelectorVisible: false })
    }
}

// default properties
ItemsList.defaultProps = {
    tableTitleStyle: { marginBottom: "30px", paddingBottom: "10px", borderBottom: "1px solid #eeeeee" },
    tableTitleIcon: <DatabaseOutlined />,
    tableActions: 'default',
    actionButtonsSpan: 8,
    searchSpan: 16,
    addButtonTitle: 'Add',
    deleteButtonTitle: 'Delete',
    reloadButtonTitle: 'Reload',
    dataKey: 'id',
    columns: [{ title: 'ItemId', dataIndex: 'id' }],
    indexCol: true,
    pagination: false,
    rowSelection: true,
    itemViewerType: 'formatted',
    itemViewerEditLink: true,
    editorAddModeTitle: 'Add',
    editorEditModeTitle: 'Edit',
    editorWidth: '50%',
    editorView: 'drawer',
    editorAddModeOkButtonTitle: 'Add',
    editorAddModelCancelButtonTitle: 'Cancel',
    editorEditModeOkButtonTitle: 'Save',
    editorEditModeCancelButtonTitle: 'Cancel',
    editorProps: {},
    itemViewerWidth: '50%',
    itemViewerView: 'drawer',
    searchUrlParameter: 'search',
    pageUrlParameter: 'page',
    pageSizeUrlParameter: 'page_size',
    defaultPageSize: 25,
    reloadKey: "$url",
}

ItemsList.propTypes = {

    /** Title to show at the top of the table. String or a ReactNode */
    tableTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),

    /** Icon to show left of title */
    tableTitleIcon: PropTypes.oneOfType([
        PropTypes.oneOf([false, null]),
        PropTypes.element,
    ]),

    /** Header style css object */
    tableTitleStyle: PropTypes.object,

    /** Table action buttons shown above the table.
    "default": 'Add', 'Delete', 'Reload' on the left and  Search Bar on the right
    and each of these can be independently controlled.
    false: Don't show the actions bar
    ReactNode: Custom ReactNode to show above the table */
    tableActions: PropTypes.oneOfType([
        PropTypes.oneOf(['default', false, null]),
        PropTypes.element
    ]),

    /** Numer of columns for the buttons on the left, default 8, 0 hides it */
    actionButtonsSpan: PropTypes.number,

    /** Numer of columns for the search on the right, default 16, 0 hides it */
    searchSpan: PropTypes.number,

    /** Title of the Add Button. false hides the button */
    addButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.oneOf([false])
    ]),

    /** Custom function called on clicking the add button.
     * Default shows the editor */
    addButtonAction: PropTypes.func,

    /** Title of the Delete Button. false hides the button */
    deleteButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.oneOf([false])
    ]),

    /** Title of the Reload Button. false hides the button */
    reloadButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.oneOf([false])
    ]),

    /** URL to get the items list. Used only if you want this component to
     * get the list of items. It's not used if you have a
     * custom itemsListMethod defined */
    itemsListUrl: PropTypes.string,

    /** Base URL (that is sufficed with dataKey) used for an 
     * item get, delete, update. 
     * It's only used if you want this component to get, delete or 
     * update item */
    itemBaseUrl: PropTypes.string,

    /** Custom function called to get list of items, 
     * default axios.get(itemsListUrl) */
    itemsListMethod: PropTypes.func,

    /** Custom function called to get an item: itemGetMethod(rowData) 
     * Default is axios.get(itemBaseUrl + key) */
    itemGetMethod: PropTypes.func,

    /** Custom function called to add an item: itemAddmethod(values)  
     * Default is axios.post(itemAddUrl, values) */
    itemAddMethod: PropTypes.func,

    /** Custom function called to edit an item: itemEditmethod(values)  
     * Default is axios.put(itemBaseUrl + key, values) */
    itemEditMethod: PropTypes.func,

    /** Custom function called to delete an item: itemDeleteMethod(rowData)
     * Default is axios.delete(itemBaseUrl+key) */
    itemDeleteMethod: PropTypes.func,

    /** Custom function called to delete multiple records: 
     * itemsDeleteMethod([list of rowData])
     * Default is to delete each record individually (check itemDeleteMethod) */
    itemsDeleteMethod: PropTypes.func,

    /** Custom function that changes/formats the response after
     * getting the items list. This may be used to delete certain fields or 
     * add more fields or format the response acceptable by this component.
     * function(rspData, rspHeaders)
     * The function should return an object with the following properties:
     * {
     * count: <total number of items available>, 
     * items: [list of items]
     * } */
    reformatListDataMethod: PropTypes.func,

    /** Object sent to the antd table as its props, check antd docs */
    tableProps: PropTypes.object,

    /** Key of the items list. Used in rowselection, get, delete, update built-ins */
    dataKey: PropTypes.string,

    /** List of Antd table columns. Each column can have an additional optional property:
     * "viewItemLink: true"
     * that can be used to make a column clickable to get and view the details of item */
    columns: PropTypes.arrayOf(PropTypes.object),

    /** Show sequence number/index for each row: true/false, default true */
    indexCol: PropTypes.bool,

    /** Make indexCol clickable to show the details of the item */
    indexColViewLink: PropTypes.bool,

    /** Show a column with actions that can be taken on each row */
    rowActions: PropTypes.arrayOf(PropTypes.oneOf([
        'duplicateItem', 'deleteItem', 'editItem'
    ])),

    /** true/false to show/hide pagination. default true */
    pagination: PropTypes.bool,

    /** true/false to show/hide rowSelection. default true */
    rowSelection: PropTypes.bool,

    /** show the item details in a drawer or modal, default drawer */
    itemViewerView: PropTypes.oneOf(["drawer", "modal"]),

    /** viewer modal/drawer width, default 40% */
    itemViewerWidth: PropTypes.string,

    /** custom function that takes the record and returns a ReactNode 
     * for display in the itemViewerView (drawer or modal) by converting
     * data to table, header etc.
     * default render the JSON record content */
    itemViewer: PropTypes.func,

    /** custom function to return the title of the record:
     * itemViewerTitle(record, rowIndex)
     * as a string or ReactNode.
     * default "Details of record[key]" */
    itemViewerTitle: PropTypes.func,

    /** show edit link in the title of the item viewer, default true */
    itemViewerEditLink: PropTypes.bool,

    /** show the editor in a drawer or modal */
    editorView: PropTypes.oneOf(["drawer", "modal"]),

    /** editor modal/drawer width, default 40% */
    editorWidth: PropTypes.string,

    /** title of the editor in Add mode, default 'Add' */
    editorAddModeTitle: PropTypes.string,

    /** title of the editor in Edit mode, default 'Edit' */
    editorEditModeTitle: PropTypes.string,

    /** editor: ReactNodeType.
     * editor must have the form name as "editor-form"
     * editor must call this.props.onSubmit(valuesObject) in onFinish handler.
     * editor is passed editorMode="add" or editorMode="edit" to inform if its in add/edit mode
     * editor is passed editorValues={dataObject} with values of the current record and must take
     * decisions on whether to show a field or not in edit mode
     * <ExternalEditor editorValues={record} editorMode="add" onSubmit={onSubmitHandler}
    */
    editor: PropTypes.elementType,

    /** title of the ok/submit button of the editor in Add Mode */
    editorAddModeOkButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),

    /** title of the cancel button of the editor in Add Mode */
    editorAddModelCancelButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),

    /** title of the ok/submit button of the editor in Edit Mode */
    editorEditModeOkButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),

    /** title of the cancel button of the editor in Edit Mode */
    editorEditModeCancelButtonTitle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),

    /** props sent to the editor */
    editorProps: PropTypes.object,

    /** function to call on search change,
     * default update url with searchUrlParameter
     */
    onSearchChange: PropTypes.func,

    /** value of the search field. if the default handler (updating browser url)
     * is used, then this value is read from the url. this is used only when a custom
     * handler onSearchChange is used 
    */
    searchValue: PropTypes.string,

    /** for the default search handler (updates the browser url), use this 
     * parameter as the search arg, default "search"
     */
    searchUrlParameter: PropTypes.string,

    /** function to call on pager change (page number or page count),
     * default update url with pageUrlparameter and pageSizeUrlParameter  */
    onPagerChange: PropTypes.func,

    /** current page number for the pagination. if the default handler (updating browser url)
     * is used for pager change, then this value is read from the url from "pageUrlParameter"
     * this is used only when a custom handler onSearchChange is used 
    */
    page: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),

    /** page_size for the pagination. if the default handler (updating browser url)
     * is used for pager change, then this value is read from the url from "pageSizeUrlParameter"
     * this is used only when a custom handler onSearchChange is used 
    */
    pageSize: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),

    /** default page size shown in the pagination selector */
    defaultPageSize: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),

    /** for the default pagination handler (updates the browser url), use this 
      * parameter as the page arg, default "page"
      */
    pageUrlParameter: PropTypes.string,

    /** for the default search handler (updates the browser url), use this 
     * parameter as the page size arg, default "page_size"
     */
    pageSizeUrlParameter: PropTypes.string,

    /** Used by the component to check if it needs to do a call to get the list of items.
     * The parent component might have searches, pagination which is passed back to this
     * component. However this does not know that it has to reload the list. So the parent
     * can set a new reloadKey. This is used by componendDidUpdate and then reloads the
     * list items. (used by the parent where there are searches or pagination)
     * Defaults to the "url" field via window.location
     */
    reloadKey: PropTypes.string
}
