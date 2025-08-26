import useUser from "./useUser";
import { useQuery } from "react-query";
import type { ResumeData } from "../models/model";
import { getSavedResumes } from "../api";


const useSavedResumes = () => {
    const { data: user, isLoading: userIsLoading } = useUser();

    const { data, isError, isLoading, refetch } = useQuery<ResumeData[]>(
        "savedResumes",
        async () => getSavedResumes(user?.uid),
        // to ensure that getSavedResumes runs after user data is fetched
        {
            enabled: !!user?.uid && !userIsLoading,   // 💡 wait until user is ready
            refetchOnWindowFocus: false,
        }
    )

    return { data, isLoading, isError, refetch }

}

export default useSavedResumes;