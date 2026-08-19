import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Sections = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Sections will design later</div>
    );
};

export default Sections;
