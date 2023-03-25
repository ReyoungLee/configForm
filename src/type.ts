/* eslint-disable @typescript-eslint/indent */
import { FormListFieldData, RadioProps, TooltipProps } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store as FormValues } from 'rc-field-form/es/interface'
import { CSSProperties } from 'react'

export type {
	FormValues,
}

export interface IDataSourceObj {
	value: number | string;
	label: string | JSX.Element;
	children?: IDataSourceObj[];
}
export interface IFieldConfig {
	/**
	 * 表单布局
	 * 默认栅格布局‘grid’
	 * 配置‘static’后 栅格布局span等props将失效
	 */
	label?: string;
	/**
	 * 表单字段的name，渲染非表单元素时作为数组渲染必须的key
	 */
	key: string | string[];
	type?:
		'radio' |
		'radiobtn' |
		'tab' |
		'select' |
		'switch' |
		'date' |
		'dateRange' |
		'textarea' |
		'cascader'|
		'number' |
		'checkbox' |
		'list' |
		'input';
	/**
	 * RangePicker为数组类型，其他需要字符串类型
	 */
	placeholder?: string | [string, string];
	disabled?: boolean;
	onChange?: (arg: any) => void;
	/**
	 * 如果默认 type 不满足需求，可以自己传入组件
	 */
	component?: React.ComponentClass<any> | React.FC<any>;
	/**
	 * 已声明属性之外 其他传给type/component所定义的组件的props
	 */
	props?: { [key: string]: any };
	/**
	 * select/radio等选择类字段的数据源
	 */
	dataSource?:
		IDataSourceObj[] |
		string[] |
		{ [key: string]: any };
	/**
	 * type为select时生效，select内选项分组时需标记为true以按分组方式处理数据源
	 */
	group?: boolean;
	initialValue?: any;
	/**
	 * 同options.fieldSpan，优先级更高
	 */
	width?: number | 'auto';
	/**
	 * 同options内同名属性，优先级更高
	 */
	wrapperSpan?: number;
	labelSpan?: number | 'auto';
	extra?: JSX.Element | string;
	/**
	 * 非表单元素的自定义内容  例如表单字段分组标题
	 */
	element?: JSX.Element;
	/**
	 * extra默认独占一行，此选项可使其位于表单项右侧同一行
	 */
	extraInline?: boolean;
	className?: string;
	style?: CSSProperties;
	/**
	 * dataSource是对象时对象的key类型为string，此选项可指定按number处理
	 */
	numKey?: boolean;
	normalize?: (value: any) => any;
	rules?: Rule[];
	/**
	 * 隐藏本字段（不存在于dom）
	 */
	hide?: boolean;
	/**
	 * available for type `list` only
	 */
	fields?: IFieldConfig[]
	/**
	 * available for type `list` only
	 */
	min?: number
	/**
	 * available for type `list` only
	 */
	max?: number
	/**
	 * available for type `list` only
	 */
	listFieldProps?: FormListFieldData
	/**
	 * 仅在mode为static时生效
	 * 渲染field到指定容器
	 * container为指定的容器id
	 */
	container?: string;
	/**
	 * field包裹ToolTip 默认不显示
	 */
	toolTip?: TooltipProps;
	/**
	 * 当type为'radio' or 'radiobtn'
	 * 自定义配置Radio/Radio.Button disabled props
	 */
	getRadioProps?: (item: IDataSourceObj) => Omit<RadioProps, 'value'>;
	/**
	 * 当type为'radio' or 'radiobtn'
	 * 为每一个Radio/Radio.Button 包裹 ToolTip
	 */
	getToolTipProps?: (item: IDataSourceObj) => TooltipProps;
}
export interface IBtnConfig {
	/**
	 * submit & reset: 提交&重置按钮，设为true时使用默认文案，
	 * 设为string值时用于按钮文案
	 */
	submit?: boolean | string;
	reset?: boolean | string;
	/**
	 * 按钮独占一行，否则与其他fields同等处理，跟在上一个field后面
	 */
	newLine?: boolean;
	/**
	 * 无论表单校验是否成功，点击提交按钮总是会执行handler
	 */
	handler?: (values: any) => void;
	/**
	 * 按钮独占一行时有效，默认居中，可以设置为居左或居右
	 */
	right?: boolean;
	left?: boolean;
}

export interface IFormConfig {
	[key: string]: any;
	mode?: 'grid' | 'static';
	/** @private */
	nested?: boolean
	ref?: React.RefObject<any> | React.ForwardedRef<any>;
	onFinish?: (values: FormValues) => void;
	onFinishFailed?: (values: FormValues) => void;
	onFieldsChange?: (values: FormValues) => void;
	onValuesChange?: (values: FormValues) => void;
	initialValues?: FormValues;
	size?: 'large' | 'small' | 'middle';
	options?: {
		/**
		 * 一般只需指定label宽度，wrapper会占满剩余空间，
		 * 若有特殊需求可以分别指定label与wrapper的宽度
		 */
		wrapperSpan?: number;
		/**
		 * 一般只需指定label宽度，wrapper会占满剩余空间，
		 * 若有特殊需求可以分别指定label与wrapper的宽度
		 */
		labelSpan?: number | 'auto';
		/**
		 * label+wrapper整体的宽度
		 */
		fieldSpan?: number | 'auto';
		readonly?: boolean;
		/**
		 * 展示模式，直接显示字段值 无表单控件
		 */
		showMode?: boolean;
		btn?: IBtnConfig;
	};
	fields: Array<IFieldConfig[] | IFieldConfig>;
	/**
	 * 将Form用作受控组件时使用，对应Antd.Form的fields属性
	 */
	fieldsController?: FormValues;
	className?: string;
	maxWidth?: number;
}

export interface IFilterConfig extends IFormConfig {
	displayAmount?: number;
	showFilterButton?: boolean;
}
