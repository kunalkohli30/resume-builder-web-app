import { useState } from 'react'
import { MdLayersClear } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { slideUpDownWithScale } from '../animation';
import { FiltersData} from '../utils/helpers';
import useFilters from '../hooks/useFilter';
import { useQueryClient } from 'react-query';

const Filters = () => {

    const [isClearHovered, setIsClearHovered] = useState(false);
    const { data: filterData } = useFilters();
    const queryClient = useQueryClient();

    const handleFilterClick = (value: string) => {
        queryClient.setQueryData('globalFilter', { searchTerm: value });
    }

    const handleClearSearch = () => {
        queryClient.setQueryData('globalFilter', { searchTerm: "" });
    }

    return (
        <div className='w-full flex items-center justify-start py-4 '>
            {/* Clear button */}
            <div
                className='border border-gray-300 rounded-md px-3 py-2 mr-2 cursor-pointer group hover:shadow-md bg-gray-200 relative'
                onMouseEnter={() => setIsClearHovered(true)}
                onMouseLeave={() => setIsClearHovered(false)}
            >
                <MdLayersClear className='text-xl' onClick={handleClearSearch}/>
                {isClearHovered && <AnimatePresence>
                    <motion.div
                        {...slideUpDownWithScale}
                        className='absolute -top-8 -left-2 bg-white shadow-md rounded-md px-2 py-1'
                    >
                        <p className='whitespace-nowrap text-xs'>Clear all</p>
                    </motion.div>
                </AnimatePresence>
                }
            </div>

            {/* Slider filter button */}
            <div className='w-full flex justify-start overflow-x-scroll gap-6 scrollbar-none'>
                {FiltersData && FiltersData.map((filterItem) => (
                    <div key={filterItem.id} onClick={() => handleFilterClick(filterItem.value)}
                        className={`border border-gray-300 rounded-md px-6 py-2 cursor-pointer group hover:shadow-md
                                ${filterData?.searchTerm === filterItem.value && 'bg-indigo-300 shadow-md'}`}>
                        <p className={`text-sm  whitespace-nowrap group-hover:scale-95
                            ${filterData?.searchTerm === filterItem.value ? "text-white font-semibold " : "text-gray-500 group-hover:text-gray-700"} `}>{filterItem.label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Filters