import {AuthContext} from "./AuthContext";
import {useContext} from "react";
// import FarmerProfile from "./FarmerProfile";
import FarmerDashboard from "./FarmerDashboard";
import FirmProfilePage from "./FirmProfilePage";
import { useParams,useSearchParams } from "react-router-dom";

const Profile = () => {
    const {user} = useContext(AuthContext);

    return (
        <>
            {user?.userType === "farmer" ? (
                <FarmerDashboard />
            ) : (
                <FirmProfilePage />
            )}
        </>
    );
}

export default Profile;