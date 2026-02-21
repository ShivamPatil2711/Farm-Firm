import FarmerFriendProfile from "./FarmerFriendProfile";
import FirmFriendProfile from "./FirmFriendProfile";
import { useParams,useSearchParams } from "react-router-dom";

const FriendProfile = () => {
const userType=useSearchParams()[0].get("userType");
const id=useParams().id;
    return (
        <>
            {userType === "farmer" ? (
                <FarmerFriendProfile id={id}  />
            ) : (
              <FirmFriendProfile id={id}  />
            )}
        </>
    );
}

export default FriendProfile;