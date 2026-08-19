import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Classes = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Classes will design later</div>
    );
};

export default Classes;
