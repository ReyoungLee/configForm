/* eslint-disable @typescript-eslint/array-type */
// import { transformMomentTime } from '@/common/utils'
// import { FilterConditions, getCommentTableData } from '@/service/comment'
import {
	Button,
} from 'antd';
// import moment from 'moment'
import React, { useEffect, useState, useCallback } from 'react';
import { FilterConfig } from './type';
import Form from './index';

import './filter.less';

const DEFAULT_FILTER_OPTIONS = {
	fieldSpan: 6,
	labelSpan: 6,
};

const DEFAULT_DISPLAY_AMOUNT = Infinity;
const GRID_AMOUNT = 24;

const Filter: React.FC<FilterConfig> = React.forwardRef<Form, FilterConfig>((props, ref) => {

	const {
		fields,
		options: optionsProp,
		displayAmount = DEFAULT_DISPLAY_AMOUNT,
		maxWidth,
		...others
	} = props;

	const options = {
		...DEFAULT_FILTER_OPTIONS,
		...optionsProp,
	};

	const form = ref as React.MutableRefObject<Form>;
	const [fieldGroup, setFieldGroup] = useState<FilterConfig['fields'][]>([fields, []]);
	const [showAll, setShowAll] = useState<boolean>(false);

	const showToggleAll = fields.length > displayAmount;

	/** it's ok to get NaNs here */
	const spacerWidth = 100 / GRID_AMOUNT / GRID_AMOUNT *
		(options.labelSpan as number) * (options.fieldSpan as number);
	const maxSpacerWidth = (maxWidth as number) / GRID_AMOUNT / GRID_AMOUNT *
		(options.labelSpan as number) * (options.fieldSpan as number);

	const submit = useCallback(() => {
		form.current?.submit();
	}, [form]);
	const reset = useCallback(() => {
		form.current?.resetFields();
	}, [form]);
	const toggleAll = useCallback(() => {
		setShowAll(!showAll);
	}, [showAll]);

	useEffect(function reCalculateShownAndHiddenFields() {
		const all = Array.from(fields);
		const fieldsShown = all.splice(0, displayAmount);
		const fieldsHidden = all;

		setFieldGroup([fieldsShown, fieldsHidden]);
	}, [fields, displayAmount]);

	return (
		<div className="c-universal-filter">
			<Form
				{...others}
				maxWidth={maxWidth}
				ref={form}
				fields={showAll ? fieldGroup.flat() : fieldGroup[0]}
				options={{
					...options,
					btn: undefined,
				}}
			/>
			<div
				className="btn-left-spacer"
				style={{ width: `${spacerWidth}%`, maxWidth: `${maxSpacerWidth}px` }}
			/>
			<Button
				type="primary"
				onClick={submit}
			>
				筛选
			</Button>
			<Button
				className="filter-btn link"
				onClick={reset}
			>
				清空
			</Button>
			{showToggleAll ?
				<Button
					className="filter-btn link"
					type="link"
					onClick={toggleAll}
				>
					{showAll ?
						<>收起<i className="iconfont">&#xe11e;</i></> :
						<>更多筛选<i className="iconfont">&#xe11f;</i></>
					}
				</Button> : null
			}
		</div>
	);
});

export default Filter;
