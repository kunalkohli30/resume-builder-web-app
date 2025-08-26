import { useQuery } from "react-query"
import { toast } from "react-toastify";
import { getUserDetails } from "../api";
import type { UserData } from "../models/model";

const useUser = () => {
    const {data, isLoading, isError, refetch} = useQuery<UserData | undefined>(
        "user",
        async () => {
            try {
                console.log("Fetching user details");
                const userDetail: UserData = await getUserDetails();
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