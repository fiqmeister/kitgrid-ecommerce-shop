// "Log in" and "Create an account" cards
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function LoginPage() {
    return (
        <div className="row g-4">
            <div className="col-md-6">
                <LoginForm />
            </div>
            <div className="col-md-6">
                <RegisterForm />
            </div>
        </div>
    );
}