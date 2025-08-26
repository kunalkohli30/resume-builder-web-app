import { Filters, MainSpinner } from '../components/index'
import useTemplates from '../hooks/useTemplates'
import type { TemplateData } from '../models/model';
import { AnimatePresence } from 'framer-motion';
import { TemplateDesignPin } from '../components';


const HomeContainer = () => {
    const { data: templates, isError: template_IsError, isLoading: template_IsLoading } = useTemplates();


    if (template_IsLoading) {
        return <MainSpinner />
    }


    return (
        <div className='w-full flex flex-col gap-10 items-start justify-center px-4 lg:px-12 py-6'>
            {/* Filter section */}
            <Filters />

            {/* Render those templates - Resume Pin */}
            {template_IsError ? (
                <>
                    <p className='text-lg'>Something went wrong... Please try again later</p>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-3">

                        {/* accent bar */}
                        <span className="h-8 w-1 rounded-full bg-indigo-500"></span>
                        <p className='text-4xl font-bold text-[#0F172A ] '>Resume Templates</p>
                    </div>
                    <div>
                        <p className="mt-2 text-slate-600">
                            Pick a layout, customize, and export in minutes.
                        </p>
                        {/* thin underline accent (optional) */}
                        <div className="mt-3 h-0.5 w-42 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-200" />
                    </div>
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8'>
                        <RenderTemplateWithAnimation templates={templates} />
                    </div>
                </>
            )}
        </div>
    )
}

const RenderTemplateWithAnimation = ({ templates }: { templates: TemplateData[] | undefined }) => {
    return (
        <>
            {templates && templates.length ? (
                <>
                    <AnimatePresence>
                        {templates.map((template, index) => (
                            <TemplateDesignPin key={template._id} data={template} index={index} />
                        ))}
                    </AnimatePresence>
                </>
            ) : (
                <>
                    <p>No data found</p>
                </>
            )}
        </>
    )
}

export default HomeContainer