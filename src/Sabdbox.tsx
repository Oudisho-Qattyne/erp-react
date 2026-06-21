import { useEffect, useState } from "react"
import { CustomSelect , type Option } from "./core/presentation/layouts/ui/inputs/CustomSelect"
export  const Sandbox = () => {
    const [value , setValue] = useState<any>(null)
    const [options , setOptions] = useState<Option[]>([])
    
    useEffect(() => {
        setTimeout(() => setOptions([{label:"syria" , value:"SY" , is_default:true} , {label:"lebanon" , value:"LE"}]) , 2000)
    } , [])


return(
<CustomSelect value={value}  options={options} searchable onChange={value => setValue(value)}/>
)
}