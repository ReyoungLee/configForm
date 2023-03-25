import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import {
	Button,
	Form as AForm,
} from 'antd'
import React from 'react'

import Form, { IFieldConfig } from './index'

interface IProps {
	fields?: IFieldConfig[]
	min?: number
	max?: number
	showMode?: boolean
	name: string | string[]
}

const List: React.FC<IProps> = (props) => {

	const {
		fields: itemConfig,
		min = 1,
		max = 4,
		showMode,
		name,
	} = props

	if (!itemConfig) {
		return null
	}
	return (
		<AForm.List name={name}>
			{(fields, { add, remove}) => (
				<>
					{fields.map((field) => (
						<div className='flex flxex-1 items-start bg-slate-50 pt-3 mb-3 pr-1 rounded-md' key={field.key}>
							<Form
								nested
								// className='flex-1'
								fields={itemConfig.map(config => ({
									...config,
									key: [`${field.key}`, ...(Array.isArray(config.key) ? config.key : [config.key])],
									listFieldProps: field,
								}))}
								options={{ showMode }}
							/>
							{!showMode && <DeleteOutlined
								onClick={() => fields.length > min && remove(field.name)}
								className={`text-lg w-6 h-8 ml-4 ${fields.length == min && 'cursor-not-allowed text-gray-300'}`}
							/>}
						</div>
					))}
					{!showMode && <Button
						onClick={() => add()}
						disabled={fields.length >= max}
						block
						type='dashed'
						className='flex items-center justify-center'
					>
						<PlusCircleOutlined className='text-lg leading-none text-gray-500' />
					</Button>}
				</>
			)}
		</AForm.List>
	)
}

export default List
