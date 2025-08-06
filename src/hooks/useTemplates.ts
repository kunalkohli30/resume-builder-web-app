import { useQuery } from "react-query"
import { getTemplates } from "../api"
import { toast } from "react-toastify";

const useTemplates = () => {

    const {data, isLoading, isError, refetch} = useQuery(
        "templates",
        async() => {
            try {
                const templates = await getTemplates();
                // console.log('fetched templates:', templates.map(t => t.imageUrl));
                return templates;
            } catch (error) {
                console.error("Error fetching templates:", error);
                toast.error("Something went wrong while fetching templates");
            }
        },
        { refetchOnWindowFocus: false }
    )

    return {data, isLoading, isError, refetch}
}

export default useTemplates;