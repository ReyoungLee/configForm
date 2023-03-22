import { DownOutlined, UpOutlined } from '@ant-design/icons'
import {
	Button,
} from 'antd'
// import moment from 'moment'
import React, { useEffect, useState, useCallback } from 'react'


import Form from './index'
import { IFieldConfig, IFilterConfig } from './type'

import './filter.less'


const DEFAULT_FILTER_OPTIONS = {
	fieldSpan: 6,
	labelSpan: 6,
}

const DEFAULT_DISPLAY_AMOUNT = Infinity
const GRID_AMOUNT = 24

const Filter: React.FC<IFilterConfig> = React.forwardRef<Form, IFilterConfig>((props, ref) => {

	const {
		fields,
		options: optionsProp,
		displayAmount = DEFAULT_DISPLAY_AMOUNT,
		showFilterButton = true,
		maxWidth,
		...others
	} = props

	const options = {
		...DEFAULT_FILTER_OPTIONS,
		...optionsProp,
	}

	const form = ref as React.MutableRefObject<Form>
	const [fieldGroup, setFieldGroup] = useState<IFilterConfig['fields'][]>([fields, []])
	const [showAll, setShowAll] = useState<boolean>(false)

	const showToggleAll = fields.length > displayAmount

	/** it's ok to get NaN here */
	const spacerWidth = 100 / GRID_AMOUNT / GRID_AMOUNT *
		(options.labelSpan as number) * (options.fieldSpan as number)
	const maxSpacerWidth = (maxWidth as number) / GRID_AMOUNT / GRID_AMOUNT *
		(options.labelSpan as number) * (options.fieldSpan as number)

	const submit = useCallback(() => {
		form.current?.submit()
	}, [form])
	const reset = useCallback(() => {
		form.current?.resetFields()
	}, [form])
	const toggleAll = useCallback(() => {
		setShowAll(!showAll)
	}, [showAll])

	useEffect(function recalculateShownAndHiddenFields() {
		const all = Array.from(fields)
		const fieldsShown = all.splice(0, displayAmount)
		const fieldsHidden = all

		setFieldGroup([fieldsShown, fieldsHidden])
	}, [fields, displayAmount])

	const extra: IFieldConfig = {
		key: 'expand',
		hide: !showToggleAll,
		labelSpan: 0,
		component: () => (
			<Button
				className='filter-btn link'
				type='link'
				onClick={toggleAll}
			>
				{showAll ?
					<>收起<UpOutlined /></> :
					<>更多筛选<DownOutlined /></>
				}
			</Button>
		),
	}

	return (
		<div className='c-universal-filter'>
			<Form
				{...others}
				maxWidth={maxWidth}
				ref={form}
				fields={showAll
					? [...fieldGroup.flat(), extra]
					: [...fieldGroup[0], extra]}
				options={{
					...options,
					btn: undefined,
				}}
			/>
			{showFilterButton && <>
				<div
					className='btn-left-spacer'
					style={{ width: `${spacerWidth}%`, maxWidth: `${maxSpacerWidth}px` }}
				/>
				<Button
					type='primary'
					onClick={submit}
				>
					筛选
				</Button>
				<Button
					className='filter-btn link'
					onClick={reset}
				>
					清空
				</Button>
			</>}
		</div>
	)
})

export default Filter
