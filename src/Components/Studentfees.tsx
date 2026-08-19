import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Studentfees = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Studentfees will design later</div>
    );
};

export default Studentfees;
