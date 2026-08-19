import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Results = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Results will design later</div>
    );
};

export default Results;
