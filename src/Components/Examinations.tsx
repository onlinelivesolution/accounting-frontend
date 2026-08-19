import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Examinations = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Examinations will design later</div>
    );
};

export default Examinations;
