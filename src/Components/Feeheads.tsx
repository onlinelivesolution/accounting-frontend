import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Feeheads = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Feeheads will design later</div>
    );
};

export default Feeheads;
