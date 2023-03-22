import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import {
	Button,
} from 'antd'
import React, { useRef, useState } from 'react'

import Form, { FormValues, IFieldConfig } from './index'

interface IProps {
	value?: FormValues[]
	onChange?: (val: FormValues[]) => void
	itemConfig?: IFieldConfig[]
	min?: number
	max?: number
	showMode?: boolean
}

let guid = 0

const List: React.FC<IProps> = (props) => {

	const { onChange, itemConfig, min = 1, max = 9, showMode, value: valueProp = [] } = props
	const [ids, setIds] = useState<number[]>(() => {
		const result: number[] = []
		for (let i = 0; i < (valueProp.length || min); i++) {
			result.push(guid++)
		}
		return result
	})
	const values = useRef<FormValues[]>(valueProp)

	const add = () => {
		setIds([...ids, guid++])
	}

	const remove = (index: number) => () => {
		if (ids.length <= min) {
			return
		}
		ids.splice(index, 1)
		values.current.splice(index, 1)
		onChange?.(values.current)
		setIds([...ids])
	}

	const handleChange = (index: number) => (value: FormValues) => {
		values.current[index] = {
			...values.current[index],
			...value,
		}
		onChange?.(values.current)
	}

	if (!itemConfig) {
		return null
	}
	return (
		<>
			{ids.map((id, i) => (
				<div className='flex items-start bg-slate-50 pt-3 mb-3 pr-1 rounded-md' key={id}>
					<Form
						className='flex-1'
						fields={itemConfig}
						onValuesChange={handleChange(i)}
						options={{ showMode }}
						initialValues={values.current[i]}
					/>
					{!showMode && <DeleteOutlined
						onClick={remove(i)}
						className={`text-lg w-6 h-8 ml-4 ${ids.length == min && 'cursor-not-allowed text-gray-300'}`}
					/>}
				</div>
			))}
			{!showMode && <Button
				onClick={add}
				disabled={ids.length >= max}
				block
				type='dashed'
				className='flex items-center justify-center'
			>
				<PlusCircleOutlined className='text-lg leading-none text-gray-500'/>
			</Button>}
		</>
	)
}

export default List
