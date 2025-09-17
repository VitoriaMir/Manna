'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/CustomAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LogoIcon } from '@/components/ui/LogoIcon';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    Github,
    Chrome,
    Facebook,
    Shield,
    Zap,
    Heart,
    BookOpen,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Star,
    Users,
    Globe,
    Smartphone,
    Award
} from 'lucide-react';

// Enhanced form validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
};

const validatePassword = (password) => {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
};

const validateUsername = (username) => {
    return {
        length: username.length >= 3 && username.length <= 20,
        format: /^[a-zA-Z0-9_]+$/.test(username),
        noSpaces: !/\s/.test(username)
    };
};

// Enhanced password strength component
const PasswordStrength = React.memo(({ password }) => {
    const validations = useMemo(() => validatePassword(password), [password]);
    const strength = useMemo(() => Object.values(validations).filter(Boolean).length, [validations]);

    const getStrengthInfo = useMemo(() => {
        if (strength < 2) return { color: 'from-red-500 to-red-600', text: 'Muito Fraca', textColor: 'text-red-400' };
        if (strength < 3) return { color: 'from-orange-500 to-red-500', text: 'Fraca', textColor: 'text-orange-400' };
        if (strength < 4) return { color: 'from-yellow-500 to-orange-500', text: 'Média', textColor: 'text-yellow-400' };
        if (strength < 5) return { color: 'from-blue-500 to-green-500', text: 'Boa', textColor: 'text-blue-400' };
        return { color: 'from-green-500 to-green-600', text: 'Excelente', textColor: 'text-green-400' };
    }, [strength]);

    if (!password) return null;

    return (
        <div className="space-y-3 animate-slideInUp">
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Força da senha:</span>
                <span className={`text-xs font-bold ${getStrengthInfo.textColor}`}>
                    {getStrengthInfo.text}
                </span>
            </div>

            <div className="relative">
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full bg-gradient-to-r ${getStrengthInfo.color} transition-all duration-700 ease-out relative`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    </div>
                </div>
                <div className="absolute -top-1 left-0 right-0 h-5 flex justify-between px-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={i}
                            className={`w-px h-5 transition-colors duration-300 ${i < strength ? 'bg-white/60' : 'bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                    { key: 'length', text: 'Min. 8 caracteres', icon: '📏' },
                    { key: 'uppercase', text: 'Letra maiúscula', icon: '🔠' },
                    { key: 'lowercase', text: 'Letra minúscula', icon: '🔡' },
                    { key: 'number', text: 'Número', icon: '🔢' },
                    { key: 'special', text: 'Símbolo especial', icon: '🔣' }
                ].map(({ key, text, icon }) => (
                    <div key={key} className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${validations[key] ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/30 border border-slate-700/50'
                        }`}>
                        <span className="text-sm">{icon}</span>
                        {validations[key] ? (
                            <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                        ) : (
                            <X className="h-3 w-3 text-slate-500 flex-shrink-0" />
                        )}
                        <span className={`text-xs font-medium transition-colors ${validations[key] ? 'text-green-400' : 'text-slate-500'
                            }`}>
                            {text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

// Enhanced social button with loading states
const SocialButton = React.memo(({ provider, icon: Icon, onClick, disabled, isLoading }) => (
    <Button
        variant="outline"
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full h-12 rounded-lg flex justify-center items-center font-medium gap-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white cursor-pointer transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-amber-400/40 hover:text-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
            <Icon className="h-5 w-5" />
        )}
        <span className="text-xs font-medium">{provider}</span>
    </Button>
));

// Premium feature card with enhanced design
const FeatureCard = React.memo(({ icon: Icon, title, description, stat, delay = 0 }) => (
    <div
        className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-400/10 transition-all duration-700 group animate-slideInUp cursor-pointer overflow-hidden"
        style={{ animationDelay: `${delay}s` }}
    >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10 flex items-start space-x-6">
            {/* Enhanced icon container */}
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-amber-400/20">
                    <Icon className="h-8 w-8 text-black" />
                </div>
                {/* Icon glow */}
                <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/40 to-orange-500/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <div className="space-y-4 flex-1">
                <div className="flex items-start justify-between">
                    <h3 className="font-black text-white group-hover:text-amber-400 transition-colors duration-500 text-xl leading-tight">
                        {title}
                    </h3>
                    {stat && (
                        <div className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-400/30 group-hover:border-amber-400/50 transition-all duration-300">
                            <span className="text-amber-400 font-bold text-xs">{stat}</span>
                        </div>
                    )}
                </div>

                <p className="text-slate-300 leading-relaxed text-base group-hover:text-slate-200 transition-colors duration-300">
                    {description}
                </p>

                {/* Progress bar animation */}
                <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                </div>
            </div>
        </div>
    </div>
));

// Enhanced notification component
const Notification = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-green-500/20',
            borderColor: 'border-green-500/40',
            textColor: 'text-green-300',
            iconColor: 'text-green-400'
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-500/20',
            borderColor: 'border-red-500/40',
            textColor: 'text-red-300',
            iconColor: 'text-red-400'
        }
    };

    const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

    return (
        <div className={`${bgColor} ${borderColor} border rounded-xl p-4 flex items-start space-x-3 animate-slideInDown`}>
            <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
                <p className={`${textColor} text-sm font-medium leading-relaxed`}>{message}</p>
            </div>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export function AuthPage({ onNavigate, onLogin, onRegister }) {
    const router = useRouter();
    const { login: authLogin, register: authRegister } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [notification, setNotification] = useState(null);

    // Enhanced form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        firstName: '',
        lastName: '',
        agreeToTerms: false
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Preload login and register images
    useEffect(() => {
        // Preload both login and register images
        const loginImage = new Image();
        loginImage.src = "/images/login.jpg";

        const registerImage = new Image();
        registerImage.src = "/images/register.jpg";

        // Preload fallback image
        const fallbackImage = new Image();
        fallbackImage.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop";

    }, []);

    // Enhanced input change handler
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear errors on change
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Real-time validation for certain fields
        if (field === 'email' && value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, [field]: 'Formato de e-mail inválido' }));
        }
    }, [errors]);

    const handleBlur = useCallback((field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field);
    }, [formData]);

    const validateField = useCallback((field) => {
        const value = formData[field];
        let error = '';

        switch (field) {
            case 'email':
                if (!value) error = 'E-mail é obrigatório';
                else if (!validateEmail(value)) error = 'Formato de e-mail inválido';
                break;
            case 'password':
                if (!value) error = 'Senha é obrigatória';
                else if (value.length < 8) error = 'Senha deve ter pelo menos 8 caracteres';
                break;
            case 'confirmPassword':
                if (!isLogin && value !== formData.password) error = 'Senhas não coincidem';
                break;
            case 'username':
                if (!isLogin && !value) error = 'Nome de usuário é obrigatório';
                else if (!isLogin) {
                    const validation = validateUsername(value);
                    if (!validation.length) error = 'Nome de usuário deve ter entre 3-20 caracteres';
                    else if (!validation.format) error = 'Apenas letras, números e _ são permitidos';
                    else if (!validation.noSpaces) error = 'Nome de usuário não pode ter espaços';
                }
                break;
            case 'firstName':
                if (!isLogin && !value) error = 'Nome é obrigatório';
                else if (!isLogin && value.length < 2) error = 'Nome deve ter pelo menos 2 caracteres';
                break;
            case 'lastName':
                if (!isLogin && !value) error = 'Sobrenome é obrigatório';
                else if (!isLogin && value.length < 2) error = 'Sobrenome deve ter pelo menos 2 caracteres';
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    }, [formData, isLogin]);

    // Enhanced form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        // Validate all required fields
        const fieldsToValidate = isLogin
            ? ['email', 'password']
            : ['email', 'password', 'confirmPassword', 'username', 'firstName', 'lastName'];

        const isValid = fieldsToValidate.every(field => validateField(field));

        if (!isValid) {
            setIsLoading(false);
            setNotification({
                type: 'error',
                message: 'Por favor, corrija os erros no formulário antes de continuar.'
            });
            return;
        }

        if (!isLogin && !formData.agreeToTerms) {
            setErrors(prev => ({ ...prev, agreeToTerms: 'Você deve aceitar os termos de uso' }));
            setIsLoading(false);
            return;
        }

        try {
            if (isLogin) {
                // Usar o login do AuthProvider
                const credentials = {
                    email: formData.email,
                    password: formData.password
                };

                console.log('Usando authLogin com:', credentials);
                const result = await authLogin(credentials);

                if (result.success) {
                    setNotification({
                        type: 'success',
                        message: `Bem-vindo de volta, ${result.user?.name || 'usuário'}!`
                    });

                    setTimeout(() => {
                        // Chamar callback se fornecido
                        onLogin?.(result.user);

                        // Tentar diferentes métodos de redirecionamento
                        if (onNavigate) {
                            onNavigate('home');
                        } else {
                            // Fallback: usar Next.js router
                            router.push('/');
                        }
                    }, 1000);
                } else {
                    setNotification({
                        type: 'error',
                        message: result.error || 'Erro ao fazer login'
                    });
                }
            } else {
                // Usar o register do AuthProvider
                const userData = {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                };

                const result = await authRegister(userData);

                if (result.success) {
                    setNotification({
                        type: 'success',
                        message: 'Conta criada com sucesso! Faça login para continuar.'
                    });
                    setTimeout(() => {
                        setIsLogin(true);
                        resetForm();
                    }, 2000);
                    onRegister?.(result.user);
                } else {
                    setNotification({
                        type: 'error',
                        message: result.error || 'Erro ao criar conta'
                    });
                }
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            console.error('Tipo do erro:', error.name);
            console.error('Mensagem do erro:', error.message);
            setNotification({
                type: 'error',
                message: 'Erro de conexão. Verifique sua internet e tente novamente.'
            });
        } finally {
            setIsLoading(false);
        }
    }, [formData, isLogin, validateField, onLogin, onNavigate, onRegister]);

    // Enhanced social login
    const handleSocialLogin = useCallback(async (provider) => {
        setSocialLoading(provider);

        try {
            // Simulate social login process
            await new Promise(resolve => setTimeout(resolve, 2000));

            setNotification({
                type: 'success',
                message: `Login com ${provider} será implementado em breve!`
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: `Erro ao fazer login com ${provider}`
            });
        } finally {
            setSocialLoading(null);
        }
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            firstName: '',
            lastName: '',
            agreeToTerms: false
        });
        setErrors({});
        setTouched({});
    }, []);

    const switchMode = useCallback(() => {
        setIsLogin(!isLogin);
        setNotification(null);
        resetForm();
    }, [isLogin, resetForm]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Enhanced animated background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
            </div>

            {/* Background image based on login/register state */}
            <div className="absolute inset-0 z-1 overflow-hidden">
                <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-20">
                    <img
                        src={isLogin ? "/images/login.jpg" : "/images/register.jpg"}
                        alt={isLogin ? "Login Background" : "Register Background"}
                        className="w-full h-full object-cover scale-105 transition-all duration-1000 ease-out"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop";
                        }}
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/85 to-slate-900/90"></div>

                    {/* Image title overlay */}
                    <div className="absolute bottom-8 left-8 opacity-60">
                        <p className="text-white/60 text-sm font-medium backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full">
                            {isLogin ? "Login" : "Criar Conta"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating particles */}
            <div className="fixed inset-0 pointer-events-none z-2">
                {Array.from({ length: 20 }, (_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <Card className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl animate-slideInRight rounded-3xl overflow-hidden">
                    <CardContent className="p-8 space-y-6">
                        {/* Logo header */}
                        <div className="flex items-center justify-center space-x-3 mb-6">
                            <LogoIcon className="text-amber-400 h-10 w-10" />
                            <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                                MANNA
                            </span>
                        </div>

                        {/* Form header */}
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-black text-white">
                                {isLogin ? 'Entrar' : 'Criar Conta'}
                            </h2>
                            <p className="text-slate-400 text-lg">
                                {isLogin
                                    ? 'Faça login para continuar sua aventura'
                                    : 'Crie sua conta e comece a explorar'
                                }
                            </p>
                        </div>

                        {/* Notification */}
                        {notification && (
                            <Notification
                                type={notification.type}
                                message={notification.message}
                                onClose={() => setNotification(null)}
                            />
                        )}

                        {/* Enhanced social login */}
                        <div className="grid grid-cols-3 gap-3">
                            <SocialButton
                                provider="Google"
                                icon={Chrome}
                                onClick={() => handleSocialLogin('Google')}
                                disabled={isLoading}
                                isLoading={socialLoading === 'Google'}
                            />
                            <SocialButton
                                provider="GitHub"
                                icon={Github}
                                onClick={() => handleSocialLogin('GitHub')}
                                disabled={isLoading}
                                isLoading={socialLoading === 'GitHub'}
                            />
                            <SocialButton
                                provider="Facebook"
                                icon={Facebook}
                                onClick={() => handleSocialLogin('Facebook')}
                                disabled={isLoading}
                                isLoading={socialLoading === 'Facebook'}
                            />
                        </div>

                        {/* Enhanced divider */}
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                                <span className="text-sm text-slate-300 font-medium">ou continue com e-mail</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        </div>

                        {/* Enhanced form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Nome</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                            <Input
                                                type="text"
                                                placeholder="Seu nome"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                onBlur={() => handleBlur('firstName')}
                                                disabled={isLoading}
                                                className={`pl-12 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 rounded-xl py-4 transition-all duration-300 ${errors.firstName && touched.firstName ? 'border-red-400 focus:border-red-400' : 'focus:border-amber-400'
                                                    }`}
                                            />
                                            {touched.firstName && !errors.firstName && formData.firstName && (
                                                <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                                            )}
                                        </div>
                                        {errors.firstName && touched.firstName && (
                                            <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp">
                                                <X className="h-3 w-3" />
                                                <span>{errors.firstName}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Sobrenome</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                            <Input
                                                type="text"
                                                placeholder="Seu sobrenome"
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                onBlur={() => handleBlur('lastName')}
                                                disabled={isLoading}
                                                className={`pl-12 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 rounded-xl py-4 transition-all duration-300 ${errors.lastName && touched.lastName ? 'border-red-400 focus:border-red-400' : 'focus:border-amber-400'
                                                    }`}
                                            />
                                            {touched.lastName && !errors.lastName && formData.lastName && (
                                                <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                                            )}
                                        </div>
                                        {errors.lastName && touched.lastName && (
                                            <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp">
                                                <X className="h-3 w-3" />
                                                <span>{errors.lastName}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Nome de usuário</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                        <Input
                                            type="text"
                                            placeholder="Como você quer ser conhecido"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                                            onBlur={() => handleBlur('username')}
                                            disabled={isLoading}
                                            className={`pl-12 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 rounded-xl py-4 transition-all duration-300 ${errors.username && touched.username ? 'border-red-400 focus:border-red-400' : 'focus:border-amber-400'
                                                }`}
                                        />
                                        {touched.username && !errors.username && formData.username && (
                                            <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                                        )}
                                    </div>
                                    {errors.username && touched.username && (
                                        <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp">
                                            <X className="h-3 w-3" />
                                            <span>{errors.username}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        disabled={isLoading}
                                        className={`pl-12 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 rounded-xl py-4 transition-all duration-300 ${errors.email && touched.email ? 'border-red-400 focus:border-red-400' : 'focus:border-amber-400'
                                            }`}
                                    />
                                    {touched.email && !errors.email && formData.email && validateEmail(formData.email) && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                                    )}
                                </div>
                                {errors.email && touched.email && (
                                    <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp">
                                        <X className="h-3 w-3" />
                                        <span>{errors.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={isLogin ? "Sua senha" : "Crie uma senha segura"}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        disabled={isLoading}
                                        className={`pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 rounded-xl py-4 transition-all duration-300 ${errors.password && touched.password ? 'border-red-400 focus:border-red-400' : 'focus:border-amber-400'
                                            }`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white p-0 h-auto transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                                {errors.password && touched.password && (
                                    <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp">
                                        <X className="h-3 w-3" />
                                        <span>{errors.password}</span>
                                    </p>
                                )}
                                {!isLogin && formData.password && (
                                    <PasswordStrength password={formData.password} />
                                )}
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Confirmar senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Digite a senha novamente"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            onBlur={() => handleBlur('confirmPassword')}
                                            disabled={isLoading}
                                            className={`pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 rounded-xl py-4 transition-all duration-300 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-400 focus:border-red-400' : 'focus:border-amber-400'
                                                }`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={isLoading}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white p-0 h-auto transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </Button>
                                        {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                            <CheckCircle2 className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                                        )}
                                    </div>
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp">
                                            <X className="h-3 w-3" />
                                            <span>{errors.confirmPassword}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Terms & Conditions */}
                            {!isLogin && (
                                <div className="space-y-3">
                                    <label className="flex items-start space-x-4 cursor-pointer group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={formData.agreeToTerms}
                                            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                            disabled={isLoading}
                                            className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400 focus:ring-2"
                                        />
                                        <div className="space-y-2">
                                            <span className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                                                Eu li e aceito os{' '}
                                                <button type="button" className="text-amber-400 hover:text-amber-300 underline font-medium">
                                                    Termos de Uso
                                                </button>{' '}
                                                e{' '}
                                                <button type="button" className="text-amber-400 hover:text-amber-300 underline font-medium">
                                                    Política de Privacidade
                                                </button>
                                            </span>
                                            <div className="flex items-center space-x-2 text-xs text-slate-400">
                                                <Shield className="h-3 w-3" />
                                                <span>Seus dados estão protegidos e seguros</span>
                                            </div>
                                        </div>
                                    </label>
                                    {errors.agreeToTerms && (
                                        <p className="text-red-400 text-xs flex items-center space-x-1 animate-slideInUp ml-4">
                                            <X className="h-3 w-3" />
                                            <span>{errors.agreeToTerms}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Forgot Password */}
                            {isLogin && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNotification({
                                                type: 'success',
                                                message: 'Em breve enviaremos instruções para recuperação de senha por e-mail!'
                                            });
                                        }}
                                        className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium underline"
                                        disabled={isLoading}
                                    >
                                        Esqueceu sua senha?
                                    </button>
                                </div>
                            )}

                            {/* Enhanced submit button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold py-5 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-3 relative z-10">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>{isLogin ? 'Fazendo login...' : 'Criando sua conta...'}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-3 relative z-10">
                                        <span>{isLogin ? 'Entrar na MANNA' : 'Criar minha conta'}</span>
                                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Enhanced mode switcher */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={switchMode}
                                disabled={isLoading}
                                className="text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 mx-auto group disabled:opacity-50 p-3 rounded-xl hover:bg-white/5"
                            >
                                {isLogin ? (
                                    <>
                                        <span>Novo na MANNA?</span>
                                        <span className="text-amber-400 font-bold group-hover:text-amber-300">
                                            Criar conta gratuita
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        <span>Já tem uma conta?</span>
                                        <span className="text-amber-400 font-bold group-hover:text-amber-300">
                                            Fazer login
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Enhanced navigation */}
                        <div className="text-center pt-6 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate('home');
                                    } else {
                                        // Fallback: redirecionar para a página inicial
                                        window.location.href = '/';
                                    }
                                }}
                                disabled={isLoading}
                                className="text-sm text-slate-400 hover:text-amber-400 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto group disabled:opacity-50 p-2 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                <span>Explorar sem cadastro</span>
                            </button>
                        </div>

                        {/* Security badge */}
                        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 pt-4">
                            <Shield className="h-4 w-4" />
                            <span>Protegido por criptografia SSL</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced floating elements with animation */}
            <div className="fixed inset-0 pointer-events-none z-2 overflow-hidden">
                {Array.from({ length: 30 }, (_, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full animate-float ${i % 3 === 0 ? 'bg-amber-400/20' :
                            i % 3 === 1 ? 'bg-purple-400/20' : 'bg-blue-400/20'
                            }`}
                        style={{
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${15 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* Enhanced styles */}
            <style jsx>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0.3;
                    }
                    25% {
                        transform: translateY(-20px) rotate(90deg);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translateY(-40px) rotate(180deg);
                        opacity: 1;
                    }
                    75% {
                        transform: translateY(-20px) rotate(270deg);
                        opacity: 0.6;
                    }
                }
                
                .animate-slideInLeft {
                    animation: slideInLeft 0.8s ease-out forwards;
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.8s ease-out forwards;
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.4s ease-out forwards;
                }

                .animate-slideInDown {
                    animation: slideInDown 0.4s ease-out forwards;
                }

                .animate-float {
                    animation: float linear infinite;
                }

                /* Enhanced glass morphism */
                .backdrop-blur-2xl {
                    backdrop-filter: blur(40px) saturate(180%);
                    -webkit-backdrop-filter: blur(40px) saturate(180%);
                }

                /* Smooth image transitions */
                .transition-opacity {
                    transition-property: opacity;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }

                .duration-\\[3000ms\\] {
                    transition-duration: 3000ms;
                }

                /* Enhanced image preloading and performance */
                img {
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    transform: translateZ(0); /* Force GPU acceleration */
                    backface-visibility: hidden;
                }

                /* Enhanced input focus states */
                input:focus {
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
                }

                /* Enhanced checkbox styling */
                input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    border-radius: 6px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }
                
                input[type="checkbox"]:checked {
                    background-color: rgb(245 158 11);
                    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
                    border-color: rgb(245 158 11);
                    transform: scale(1.1);
                }

                input[type="checkbox"]:hover {
                    border-color: rgba(245, 158, 11, 0.5);
                }

                /* Scrollbar enhancement */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.2);
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(245, 158, 11, 0.4);
                    border-radius: 4px;
                    transition: background 0.3s ease;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(245, 158, 11, 0.6);
                }

                /* Selection colors */
                ::selection {
                    background: rgba(245, 158, 11, 0.3);
                    color: white;
                }

                /* Accessibility improvements */
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                    
                    .animate-float {
                        animation: none;
                    }
                }

                @media (prefers-contrast: high) {
                    .bg-white\\/5 {
                        background-color: rgba(255, 255, 255, 0.15);
                    }
                    
                    .border-white\\/20 {
                        border-color: rgba(255, 255, 255, 0.4);
                    }
                    
                    .text-slate-400 {
                        color: rgba(203, 213, 225, 0.9);
                    }
                }

                /* Print styles */
                @media print {
                    .bg-gradient-to-br,
                    .backdrop-blur-2xl,
                    .animate-pulse,
                    .animate-float {
                        background: white !important;
                        backdrop-filter: none !important;
                        animation: none !important;
                    }
                    
                    .text-white {
                        color: black !important;
                    }
                    
                    .bg-white\\/10 {
                        background: white !important;
                        border: 2px solid #ccc !important;
                    }
                    
                    .fixed {
                        position: static !important;
                    }
                }

                /* High performance GPU acceleration */
                .animate-slideInLeft,
                .animate-slideInRight,
                .animate-slideInUp,
                .animate-slideInDown,
                .animate-float {
                    will-change: transform, opacity;
                    transform: translateZ(0);
                }

                /* Enhanced button effects */
                .group:hover .group-hover\\:translate-x-1 {
                    transform: translateX(0.25rem);
                }
                
                .group:hover .group-hover\\:-translate-x-1 {
                    transform: translateX(-0.25rem);
                }
 
                .group:hover .group-hover\\:scale-110 {
                    transform: scale(1.1);
                }

                .group:hover .group-hover\\:rotate-12 {
                    transform: rotate(12deg);
                }
            `}</style>
        </div>
    );
} 