import { useQuery } from "react-query"
import { toast } from "react-toastify";
import { getUserDetails } from "../api";

const useUser = () => {
    const {data, isLoading, isError, refetch} = useQuery(
        "user",
        async () => {
            try {
                console.log("Fetching user details");
                const userDetail = await getUserDetails();
                return userDetail;
            } catch(error: any) {
                if(!error.message.includes("not authenticated")) {
                    toast.error("Something went wrong....");
                }
            }
        }, {
            refetchOnWindowFocus: false,
        }
    );
    return {data, isLoading, isError, refetch};
}

export default useUser;