import moment from 'moment';
import { get, set } from 'lodash';
import { Store as FormValues } from 'rc-field-form/es/interface';
import {
	DataSourceObj,
	FieldConfig,
} from './type';

declare type Value = string | number | undefined;
declare type Obj = Record<string, any>;

// export const toNum = (val: Value): Value =>
// 	((val === '' || val == undefined) ? undefined : +val)

export const findValue = (arr: DataSourceObj[], val: Value): Value =>
	arr.find(e => e.value === val)?.label ?? val;
/**
 * convert datasource of other types to the format which form needs: Array<{ value, label }>
 */
export const convertDataSource = (data: any[] | Obj, numKey: FieldConfig['numKey']): DataSourceObj[] => {
	let dataSource: DataSourceObj[];
	if (!Array.isArray(data)) {
		// data: { key: value }
		dataSource = Object.entries(data).map(([value, label]) => ({
			value: numKey ? +value : value,
			label: label as string,
		}));
	}
	else if (typeof data[0] == 'string') {
		// data: [value, value,...]
		dataSource = data.map((label: string) => ({
			value: label,
			label,
		}));
	}
	else {
		// data: [{ value, text },...] | []
		dataSource = data;
	}
	return dataSource;
};

export const getValuePropName = (type: FieldConfig['type']): string => {
	const valueNames = {
		switch: 'checked',
		tab: 'activeKey',
	};
	return valueNames[type ?? ''] || 'value';
};

export const getNormalizeFunc = (type: FieldConfig['type']): ((val: any) => any) | undefined => {
	switch (type) {
		case 'number':
			return val => ((val === '' || val == undefined) ? undefined : +val);
	}
};

export const getCascaderLabels = (dataSource: DataSourceObj[], val: any[]): string[] => {
	let current = dataSource;
	const labels = [];
	for (const item of val) {
		const result = current.find(e => e.value == item);
		if (result) {
			labels.push(result.label);
			current = result.children || [];
		}
		else {
			return labels;
		}
	}
	return labels;
};

export const filterFormDataType = (fields: FieldConfig[], values: FormValues, toForm?: boolean): FormValues => {

	const result = {};
	for (const field of fields) {
		const { key } = field;
		let parent: FormValues;
		let lastKey: string;

		if (Array.isArray(key)) {
			const parentKey = key.slice(0, key.length - 1);
			parent = parentKey.length ? (get(values, parentKey) || {}) : values;
			lastKey = key[key.length - 1];
		}
		else {
			parent = values;
			lastKey = key;
		}
		/**
		 * skip if the key doesn't exist in values
		 * keep the value [undefined] if the key exists with a value [undefined]
		 */
		if (!(lastKey in parent)) {
			continue;
		}
		const val = parent[lastKey];
		let newVal = val;
		switch (field.type) {
			case 'date':
				newVal = toForm ? moment(val) : +val;
				break;
			case 'dateRange':
				newVal = toForm ?
					[moment(val[0]), moment(val[1])] :
					[+val[0], +val[1]];
		}
		set(result, key, newVal);
	}
	return result;
};

