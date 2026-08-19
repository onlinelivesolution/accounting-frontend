import axios from "axios";
import { useAuth } from "./securityContext";
import { useNavigate } from "react-router-dom";

const Enrollments = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
        <div>Enrollment will design later</div>
    );
};

export default Enrollments;
