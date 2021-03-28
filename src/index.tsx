/* eslint-disable no-case-declarations */
import React from 'react';
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
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { ButtonHTMLType } from 'antd/lib/button/button';
import { Store as FormValues } from 'rc-field-form/es/interface';
import {
	FormConfig,
	FieldConfig,
	DataSourceObj,
	BtnConfig,
} from './type';
import {
	findValue,
	convertDataSource,
	getValuePropName,
	getNormalizeFunc,
	getCascaderLabels,
	filterFormDataType,
} from './util';

import './index.less';

const { RangePicker } = DatePicker;
const DEFAULT_LABEL_SPAN = 6;
const TOTAL_SPAN = 24;
const DEFAULT_RESET_TEXT = '重置';
const DEFAULT_SUBMIT_TEXT = '提交';

class Form extends React.Component<FormConfig> {
	formRef = React.createRef<FormInstance>();
	setFieldsValue(value: FormValues): void {
		this.formRef.current?.setFieldsValue(
			filterFormDataType(this.props.fields, value, true)
		);
	}
	getFieldsValue(...args: any[]): FormValues | undefined {
		// @ts-ignore
		const value = this.formRef.current?.getFieldsValue(...args);
		return value && filterFormDataType(
			this.props.fields,
			value
		);
	}
	resetFields(...args: any[]): void {
		this.formRef.current?.resetFields(...args);
	}
	submit(): void {
		this.formRef.current?.submit();
	}
	validateFields(...args: any[]): Promise<FormValues> | undefined {
		return this.formRef.current?.validateFields(...args);
	}
	private readonly onValuesChange = (value: FormValues): void => {
		const { onValuesChange, fields } = this.props;
		const result = filterFormDataType(fields, value);
		onValuesChange?.(result);
	};
	private readonly onFinish = (value: FormValues): void => {
		const { onFinish, fields } = this.props;
		const result = filterFormDataType(fields, value);
		onFinish?.(result);
	};
	renderField(field: FieldConfig): JSX.Element {
		const { options = {} } = this.props;
		const {
			component: Comp,
			props = {},
			dataSource: data = [],
			placeholder,
		} = field;

		if (Comp) {
			return (
				<Comp
					{...props}
					formOptions={options}
					showMode={options.showMode}
				/>
			);
		}
		if (field.type == 'tab' && field.numKey) {
			console.warn('UForm: field type tab supports string value only');
		}
		const dataSource = convertDataSource(data, field.numKey);
		if (options.showMode && field.type != 'tab') {
			const Display = this.getShowModeContent(field, dataSource);
			return <Display />;
		}
		const commonProps = {
			onChange: field.onChange,
			placeholder: typeof placeholder == 'string' ? placeholder : undefined,
			disabled: field.disabled || options.readonly,
			...props,
		};
		switch (field.type) {
			case 'radiobtn':
			case 'radio' :
				const Comp = field.type == 'radio' ? Radio : Radio.Button;
				return (
					<Radio.Group
						{...commonProps}
					>
						{dataSource.map(({ label, value }: DataSourceObj) => (
							<Comp
								key={value}
								value={value}
							>
								{label}
							</Comp>
						))}
					</Radio.Group>
				);
			case 'tab':
				return (
					<Tabs
						{...commonProps}
					>
						{dataSource.map(({ label, value }: DataSourceObj) => (
							<Tabs.TabPane
								tab={label}
								key={value}
							/>
						))}
					</Tabs>
				);
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
						{dataSource.map(({ label, value }: DataSourceObj) => (
							<Select.Option
								key={value}
								value={value}
							>
								{label}
							</Select.Option>
						))}
					</Select>
				);
			case 'switch':
				return (
					<Switch
						{...commonProps}
					/>
				);
			case 'date':
				return (
					<DatePicker
						{...commonProps}
					/>
				);
			case 'dateRange':
				return (
					<RangePicker
						{...commonProps}
						placeholder={Array.isArray(placeholder) ? placeholder : undefined}
					/>
				);
			case 'textarea':
				return (
					<Input.TextArea
						{...commonProps}
					/>
				);
			case 'cascader':
				return (
					<Cascader
						{...commonProps}
						options={dataSource}
					/>
				);
			case 'number':
				return (
					<InputNumber
						{...commonProps}
					/>
				);
			case 'input':
			default:
				return (
					<Input
						allowClear
						{...commonProps}
					/>
				);
		}
	}
	getShowModeContent(field: FieldConfig, dataSource: DataSourceObj[]): React.FC {
		let Display: React.FC<{ value?: any }>;
		const DATE_FORMAT = `YYYY-MM-DD${field?.props?.showTime ? ' hh:mm:ss' : ''}`;
		switch (field.type) {
			case 'radio':
			case 'select':
				Display = ({ value }) => <span>{findValue(dataSource, value)}</span>;
				break;
			case 'switch':
				Display = ({ value }) => <span>{value ? '是' : '否'}</span>;
				break;
			case 'date':
				Display = ({ value }) => <span>{value?.format(DATE_FORMAT)}</span>;
				break;
			case 'dateRange':
				Display = ({ value = [] }) => (
					<span>{value[0]?.format(DATE_FORMAT)} ~ {value[1]?.format(DATE_FORMAT)}</span>
				);
				break;
			case 'cascader':
				Display = ({ value = [] }) => {
					const labels = getCascaderLabels(dataSource, value);
					return <span>{labels.join(' / ')}</span>;
				};
				break;
			default:
				Display = ({ value }) => <span>{value}</span>;
		}
		return Display;
	}
	renderBtn(config: BtnConfig): JSX.Element {
		const submitProps = {
			htmlType: 'submit' as ButtonHTMLType,
			onClick: config?.handler,
		};
		// if (config?.handler) {
		// 	delete submitProps.htmlType
		// }
		return (
			<>
				{config.submit &&
					<Button
						type="primary"
						{...submitProps}
					>
						{typeof config.submit == 'string' ? config.submit : DEFAULT_SUBMIT_TEXT}
					</Button>
				}
				{config.reset &&
					<Button
						className="reset"
						onClick={() => this.resetFields()}
					>
						{typeof config.reset == 'string' ? config.reset : DEFAULT_RESET_TEXT}
					</Button>
				}
			</>
		);
	}
	render(): JSX.Element {
		const {
			fields = [],
			fieldsController = [],
			options = {},
			className = '',
			initialValues,
			maxWidth,
			...others
		} = this.props;
		const btn: BtnConfig = options.btn || {};
		// field may be null
		const children = fields.map((field: FieldConfig) => {
			if (!field || field.hide) {
				return null;
			}
			const keyStr = Array.isArray(field.key) ? field.key.join('.') : field.key;
			if (field.element) {
				return React.cloneElement(field.element, { key: keyStr });
			}
			const labelSpan = field.labelSpan ?? options.labelSpan ?? DEFAULT_LABEL_SPAN;
			const wrapperSpan = field.wrapperSpan ?? options.wrapperSpan ??
				labelSpan == 'auto' ? 'auto' : (TOTAL_SPAN - labelSpan);

			return (
				<Col
					span={field.width ?? options.fieldSpan ?? DEFAULT_LABEL_SPAN}
					key={keyStr}
					className={field.className}
					style={field.style}
				>
					<AForm.Item
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
				</Col>
			);
		});
		const btnClassName = `submit-btn ${btn.right ? 'right' : (btn.left ? 'left' : '')}`;
		const convertedFieldsValue = fieldsController &&
			Object.entries(filterFormDataType(fields, fieldsController, true)).map(
				([name, value]) => ({ name, value })
			);
		return (
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
				<Row>
					{children}
					{((btn.submit || btn.reset) && !btn.newLine) &&
						<Col
							span={options.wrapperSpan}
							className={btnClassName}
						>
							<AForm.Item>{this.renderBtn(btn)}</AForm.Item>
						</Col>
					}
				</Row>
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
			</AForm>
		);
	}
}

export default Form;
export type {
	FormValues,
};

export type {
	FormConfig,
	FieldConfig,
	FilterConfig,
} from './type';

export * as Filter from './Filter';
