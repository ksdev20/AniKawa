import { useState, useEffect, useRef } from 'react';
import './log-sign.css';
import fetchUserDetails from '../../global_assets/FetchUserDetails';

type AuthFormProps = {
    keyword: string,
    title: string,
    buttonLabel: string,
    apiEndPoint: string
}

function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password: string) {
    if (password.length >= 6 && !password.includes(' ')) {
        return true;
    }
    return false;
}

function LinksElement({ keyword }: { keyword: string }) {
    if (keyword == 's') {
        return (
            <>
                <div className="alt-login-text">Already have an account?
                    <a className="to-login" href="/login">LOG IN</a>
                </div>
                <p className="terms-para">By creating an account you're agreeing to our
                    <a className="term-policy-link" href="/legal/tos/" target="_blank">Terms</a>
                    &
                    <a className="term-policy-link" href="/legal/privacy-policy/" target="_blank">Privacy Policy</a> <b>,</b>
                    and you confirm that you are at least 18 years of age.
                </p>
            </>
        )
    } else {
        return (
            <div className="after-next-links">
                <a className="to-login">FORGOT PASSWORD?</a>
                <b className="after-next-separator">|</b>
                <a className="to-login" href="/signup">CREATE ACCOUNT</a>
            </div>
        )
    }
}

export default function AuthForm({
    keyword, title, buttonLabel, apiEndPoint
}: AuthFormProps) {
    const [validEmail, setValidEmail] = useState(true);
    const [validPassword, setValidPassword] = useState(true);
    const [validButton, setValidButton] = useState(false);

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const eRef = emailRef.current;
        const pRef = passwordRef.current;

        if (!eRef || !pRef) return;

        const handleEmail = () => setValidEmail(isValidEmail(eRef.value));
        const handlePassword = () => setValidPassword(isValidPassword(pRef.value));

        eRef.addEventListener('input', handleEmail);
        pRef.addEventListener('input', handlePassword);

        return () => {
            eRef.removeEventListener('input', handleEmail);
            pRef.removeEventListener('input', handlePassword);
        }
    }, []);

    useEffect(() => {
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !password) return;

        setValidButton(isValidEmail(email) && isValidPassword(password));

    }, [validEmail, validPassword]);

    function apiCall() {
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !password) return;

        fetch(`http://localhost:20000/api/${apiEndPoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log(`${buttonLabel} Successsful ✅`);
                    fetchUserDetails().then(() => {
                        window.location.href = '/';
                    });
                } else {
                    alert(data.error);
                }
            })
            .catch(e => {
                console.error(e.message);
            });
    }

    return (
        <div className="main">
            <div className="main-content">
                <div className="main-heading">{title}</div>
                <div className="form-section">
                    <div className="form-section email">
                        <input ref={emailRef} type="email" id="email" placeholder=" " required />
                        <label htmlFor="email" id="email-label" className={`${!validEmail ? 'invalid' : ''}`}>{validEmail ? 'Email Address' : 'Invalid Email Address'}</label>
                    </div>
                    <div className="form-section password">
                        <input ref={passwordRef} type="password" id="password" placeholder=" " required />
                        <label htmlFor="password" className={`floating-label ${!validPassword ? 'invalid' : ''}`} id="password-label">Password</label>
                    </div>
                    {keyword == 's' ? <label className="password-note">Use at least 6 characters, do not use empty spaces</label> : <div></div>}
                </div>
                <div className={`create-account-btn ${validButton ? 'active' : ''}`} onClick={() => {
                    if (validButton) {
                        apiCall();
                    }
                }}>{buttonLabel}</div>
                <LinksElement keyword={keyword} />
            </div>
        </div>
    )
}