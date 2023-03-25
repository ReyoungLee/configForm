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
	listItemClassName?: string
}

const List: React.FC<IProps> = (props) => {

	const {
		fields: itemConfig,
		min = 1,
		max = 4,
		showMode,
		name,
		listItemClassName = '',
	} = props

	if (!itemConfig) {
		return null
	}
	return (
		<AForm.List name={name}>
			{(fields, { add, remove}) => (
				<>
					{fields.map((field) => (
						<div className={`formlist-item ${listItemClassName}`} key={field.key}>
							<Form
								nested
								fields={itemConfig.map(config => ({
									...config,
									key: [`${field.key}`, ...(Array.isArray(config.key) ? config.key : [config.key])],
									listFieldProps: field,
								}))}
								options={{ showMode }}
							/>
							{!showMode && <DeleteOutlined
								onClick={() => fields.length > min && remove(field.name)}
								className={`delete-btn ${fields.length == min && ' disabled'}`}
							/>}
						</div>
					))}
					{!showMode && <Button
						onClick={() => add()}
						disabled={fields.length >= max}
						block
						type='dashed'
						className='formlist-add-btn'
					>
						<PlusCircleOutlined />
					</Button>}
				</>
			)}
		</AForm.List>
	)
}

export default List
