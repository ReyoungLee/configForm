/* eslint-disable complexity */
import {
	Form as AForm,
	Input,
	Cascader,
	InputNumber,
	Row,
	Col,
	Switch,
	Select,
	Radio,
	DatePicker,
	Button,
	Tabs,
	Tooltip,
	Checkbox,
} from 'antd'
import { ButtonHTMLType } from 'antd/lib/button/button'
import { FormInstance } from 'antd/lib/form'
import React from 'react'
import { createPortal } from 'react-dom'

import List from './List'
import {
	IFormConfig,
	IFieldConfig,
	IDataSourceObj,
	IBtnConfig,
	FormValues,
} from './type'
import {
	findValue,
	convertDataSource,
	getValuePropName,
	getNormalizeFunc,
	getCascaderLabels,
	filterFormDataType,
} from './util'

import './index.less'


const { RangePicker } = DatePicker
const { Group } = Checkbox
const DEFAULT_LABEL_SPAN = 6
const DEFAULT_FIELD_SPAN = 24
const TOTAL_SPAN = 24
const DEFAULT_RESET_TEXT = '重置'
const DEFAULT_SUBMIT_TEXT = '提交'

class Form extends React.Component<IFormConfig> {
	formRef = React.createRef<FormInstance>()
	setFieldsValue(value: FormValues): void {
		this.formRef.current?.setFieldsValue(
			filterFormDataType(this.props.fields, value, true)
		)
	}
	getFieldsValue(...args: any[]): FormValues | undefined {
		// @ts-ignore
		const value = this.formRef.current?.getFieldsValue(...args)
		return value && filterFormDataType(
			this.props.fields,
			value
		)
	}
	resetFields(...args: any[]): void {
		this.formRef.current?.resetFields(...args)
	}
	submit(): void {
		this.formRef.current?.submit()
	}
	validateFields(...args: any[]): Promise<FormValues> | undefined {
		return this.formRef.current?.validateFields(...args)
	}
	private readonly onValuesChange = (value: FormValues): void => {
		const { onValuesChange, fields } = this.props
		const result = filterFormDataType(fields, value)
		onValuesChange?.(result)
	}
	private readonly onFinish = (value: FormValues): void => {
		const { onFinish, fields } = this.props
		const result = filterFormDataType(fields, value)
		onFinish?.(result)
	}
	renderField(field: IFieldConfig): JSX.Element {
		const { options = {} } = this.props
		const {
			component: Comp,
			props = {},
			dataSource: data = [],
			placeholder,
			getRadioProps = () => ({ disabled: false }),
			getToolTipProps = () => ({ title: false }),
		} = field

		if (Comp) {
			return (
				<Comp
					{...props}
					formOptions={options}
					showMode={options.showMode}
				/>
			)
		}
		if (field.type == 'tab' && field.numKey) {
			console.warn('UForm: field type tab supports string value only')
		}
		const dataSource = convertDataSource(data, field.numKey)
		if (options.showMode && field.type != 'tab') {
			const Display = this.getShowModeContent(field, dataSource)
			return <Display />
		}
		const commonProps = {
			onChange: field.onChange,
			placeholder: typeof placeholder == 'string' ? placeholder : undefined,
			disabled: field.disabled || options.readonly,
			...props,
		}
		switch (field.type) {
		case 'radiobtn':
		case 'radio':
			const Comp = field.type == 'radio' ? Radio : Radio.Button
			return (
				<Radio.Group
					{...commonProps}
				>
					{dataSource.map((item: IDataSourceObj) => {
						const { label, value } = item
						return (
							<Tooltip
								key={value}
								{...getToolTipProps(item)}
							>
								<Comp
									value={value}
									{...getRadioProps(item)}
								>
									{label}
								</Comp>
							</Tooltip>
						)
					})}
				</Radio.Group>
			)
		case 'tab':
			return (
				<Tabs
					{...commonProps}
				>
					{dataSource.map(({ label, value }: IDataSourceObj) => (
						<Tabs.TabPane
							tab={label}
							key={value}
						/>
					))}
				</Tabs>
			)
		case 'select':
			return (
				<Select
					showSearch
					allowClear
					filterOption={(input, option) =>
						option?.props.children.toLowerCase().includes(input.toLowerCase())
					}
					{...commonProps}
				>
					{field.group ?
						dataSource.map(({ label: groupLabel, value, children }) => (
							<Select.OptGroup label={groupLabel} key={value}>
								{convertDataSource(children || [], field.numKey)?.map(({ label, value }) => (
									<Select.Option
										key={value}
										value={value}
									>
										{label}
									</Select.Option>
								))}
							</Select.OptGroup>
						)) :
						dataSource.map(({ label, value }) => (
							<Select.Option
								key={value}
								value={value}
							>
								{label}
							</Select.Option>
						))
					}
				</Select>
			)
		case 'switch':
			return (
				<Switch
					{...commonProps}
				/>
			)
		case 'date':
			return (
				<DatePicker
					{...commonProps}
				/>
			)
		case 'dateRange':
			return (
				<RangePicker
					{...commonProps}
					placeholder={Array.isArray(placeholder) ? placeholder : undefined}
				/>
			)
		case 'textarea':
			return (
				<Input.TextArea
					{...commonProps}
				/>
			)
		case 'cascader':
			return (
				<Cascader
					{...commonProps}
					options={dataSource}
				/>
			)
		case 'number':
			return (
				<InputNumber
					{...commonProps}
				/>
			)
		case 'checkbox':
			return (
				<Group
					options={dataSource}
					{...commonProps}
				/>
			)
		case 'list':
			return (
				<List
					{...commonProps}
					fields={field.fields}
					min={field.min}
					max={field.max}
					name={field.key}
				/>
			)
		case 'input':
		default:
			return (
				<Input
					allowClear
					{...commonProps}
				/>
			)
		}
	}
	getShowModeContent(field: IFieldConfig, dataSource: IDataSourceObj[]): React.FC {
		let Display: React.FC<{ value?: any, checked?: boolean }>
		const DATE_FORMAT = `YYYY-MM-DD${field?.props?.showTime ? ' hh:mm:ss' : ''}`
		switch (field.type) {
		case 'radio':
		case 'select':
			Display = ({ value }) => <span>{findValue(dataSource, value)}</span>
			break
		case 'switch':
			Display = ({ checked }) => <span>{checked ? '是' : '否'}</span>
			break
		case 'date':
			Display = ({ value }) => <span>{value?.format(DATE_FORMAT)}</span>
			break
		case 'dateRange':
			Display = ({ value = [] }) => (
				<span>{value[0]?.format(DATE_FORMAT)} ~ {value[1]?.format(DATE_FORMAT)}</span>
			)
			break
		case 'cascader':
			Display = ({ value = [] }) => {
				const labels = getCascaderLabels(dataSource, value)
				return <span>{labels.join(' / ')}</span>
			}
			break
		case 'list':
			Display = () => {
				return (
					<List
						showMode
						fields={field.fields}
						name={field.key}
					/>
				)
			}
			break
		default:
			Display = ({ value }) => <span>{value}</span>
		}
		return Display
	}
	renderBtn(config: IBtnConfig): JSX.Element {
		const submitProps = {
			htmlType: 'submit' as ButtonHTMLType,
			onClick: config?.handler,
		}
		// if (config?.handler) {
		// 	delete submitProps.htmlType
		// }
		return (
			<>
				{config.submit &&
					<Button
						type='primary'
						{...submitProps}
					>
						{typeof config.submit == 'string' ? config.submit : DEFAULT_SUBMIT_TEXT}
					</Button>
				}
				{config.reset &&
					<Button
						className='reset'
						onClick={() => this.resetFields()}
					>
						{typeof config.reset == 'string' ? config.reset : DEFAULT_RESET_TEXT}
					</Button>
				}
			</>
		)
	}
	render(): JSX.Element {
		const {
			mode = 'grid',
			fields = [],
			fieldsController = [],
			options = {},
			className = '',
			initialValues,
			maxWidth,
			nested,
			...others
		} = this.props
		/** static布局 且表单项仅有一行 */
		const isStaticFieldsInOneRow = mode === 'static' && fields.every(field => !Array.isArray(field))
		const btn: IBtnConfig = options.btn || {}
		// field may be null
		const renderFields = (fields: IFieldConfig[]) => fields.map((field: IFieldConfig) => {
			if (!field || field.hide) {
				return null
			}
			const keyStr = Array.isArray(field.key) ? field.key.join('.') : field.key
			if (field.element) {
				return (
					<Tooltip
						key={keyStr}
						title=''
						{...field.toolTip}
					>
						{field.element}
					</Tooltip>)
			}
			const labelSpan = field.labelSpan ?? options.labelSpan ?? DEFAULT_LABEL_SPAN
			const wrapperSpan = field.wrapperSpan ?? options.wrapperSpan ??
				(labelSpan == 'auto' ? 'auto' : (TOTAL_SPAN - labelSpan))

			const staticModeField = (
				<Tooltip
					key={keyStr}
					title=''
					{...field.toolTip}
				>
					<AForm.Item
						{...field.listFieldProps}
						style={field.style}
						className={`${field.extraInline ? 'inline-extra' : ''} ${field.className}`}
						label={field.label || (labelSpan != 0 && ' ')}
						name={field.key || field.label}
						extra={options.showMode ? null : field.extra}
						colon={!!(options.showMode && field.label)}
						rules={field.rules}
						initialValue={field.initialValue}
						normalize={field.normalize || getNormalizeFunc(field.type)}
						valuePropName={getValuePropName(field.type)}
					>
						{this.renderField(field)}
					</AForm.Item>
				</Tooltip>
			)

			const containerElement = document.querySelector(`#${field.container}`)
			return (
				mode === 'grid' ?
					<Col
						span={field.width ?? options.fieldSpan ?? DEFAULT_FIELD_SPAN}
						key={keyStr}
						className={field.className}
						style={field.style}
					>
						<Tooltip title='' {...field.toolTip}>
							<AForm.Item
								{...field.listFieldProps}
								className={field.extraInline ? 'inline-extra' : ''}
								label={field.label || (labelSpan != 0 && ' ')}
								name={field.key || field.label}
								labelCol={{ span: labelSpan }}
								wrapperCol={{ span: wrapperSpan }}
								extra={options.showMode ? null : field.extra}
								colon={!!(options.showMode && field.label)}
								rules={field.rules}
								initialValue={field.initialValue}
								normalize={field.normalize || getNormalizeFunc(field.type)}
								valuePropName={getValuePropName(field.type)}
							>
								{this.renderField(field)}
							</AForm.Item>
						</Tooltip>
					</Col> : (
						field.container && containerElement
							? createPortal(
								staticModeField,
								containerElement
							)
							: staticModeField
					)
			)
		})
		const btnClassName = `submit-btn ${btn.right ? 'right' : (btn.left ? 'left' : '')}`
		const convertedFieldsValue = fieldsController &&
			Object.entries(filterFormDataType(fields, fieldsController, true)).map(
				([name, value]) => ({ name, value })
			)
		const contents = <>
			{mode === 'grid' || isStaticFieldsInOneRow ?
				<Row>
					{renderFields(fields as IFieldConfig[])}
					{((btn.submit || btn.reset) && !btn.newLine) &&
						<Col
							span={options.wrapperSpan}
							className={btnClassName}
						>
							<AForm.Item>{this.renderBtn(btn)}</AForm.Item>
						</Col>
					}
				</Row> :
				fields.map((fieldOrFields, index) => {
					return (
						<Row key={String(index)}>
							{renderFields(
								Array.isArray(fieldOrFields)
									? fieldOrFields
									: [fieldOrFields]
							)}
						</Row>
					)
				})
			}
			{btn.newLine &&
				<Row>
					<Col
						span={TOTAL_SPAN}
						className={btnClassName}
					>
						{this.renderBtn(btn)}
					</Col>
				</Row>
			}
		</>
		return (nested ? contents :
			<AForm
				className={`c-universal-form ${className}`}
				initialValues={initialValues && filterFormDataType(fields, initialValues, true)}
				scrollToFirstError
				ref={this.formRef}
				{...others}
				style={{ maxWidth }}
				onFinish={this.onFinish}
				onValuesChange={this.onValuesChange}
				fields={convertedFieldsValue}
			>
				{contents}
			</AForm>
		)
	}
}

export default Form

export type {
	IFormConfig,
	IFieldConfig,
	IFilterConfig,
	FormValues,
} from './type'

export * as Filter from './Filter'
