import { useParams } from 'react-router-dom'
import { TemplatesData } from '../utils/helpers';

const CreateResume = () => {

    const {templateName} = useParams<{templateName: string}>();

    const match = TemplatesData.find(t => t.name.toLowerCase() === (templateName ?? "").toLowerCase());
    if(match) {
        const Comp = match.component;
        return <Comp />;
    }
    return (
        <div className='w-full flex flex-col items-center justify-start py-4'>CreateResume</div>
    )
}

export default CreateResume