"use client"; // Next.js Client Component로 설정합니다.

import React, { useState } from 'react';

// 💡 D.I.S. 폼 컴포넌트: 사용자 입력 및 API 통신을 담당합니다.
export default function DIsForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        riskDescription: '', // 시스템 구조적 결함 설명
        isLoading: false,
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.riskDescription) {
            alert("이메일과 시스템 위험 설명을 반드시 입력해 주세요.");
            return;
        }

        setFormData(prev => ({ ...prev, isLoading: true, message: '' }));

        try {
            // ⚙️ API 호출 (실제 백엔드 엔드포인트와 연결)
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/diagnose/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    system_risk_description: formData.riskDescription,
                    interest_area: '구조적 결함 진단'
                })
            });

            const result = await response.json();

            if (result.status === "success") {
                setFormData(prev => ({ ...prev, isLoading: false, message: `✅ ${result.message} 다음으로 필수 체크리스트를 받아가세요!` }));
            } else {
                setFormData(prev => ({ ...prev, isLoading: false, message: `❌ 오류 발생: ${result.message}` }));
            }

        } catch (error) {
            console.error("Submission error:", error);
            setFormData(prev => ({ ...prev, isLoading: false, message: "🚨 네트워크 연결 또는 서버 오류가 발생했습니다." }));
        }
    };

    return (
        <div className="p-8 bg-[#121212] border border-cyan-700/50 shadow-lg">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 tracking-wider">
                [진단 프로세스 진입] 필수 정보 입력
            </h2>
            <p className="text-gray-400 mb-8">
                당신의 시스템이 가진 '가장 구조적인 결함'을 서술해 주세요. 이 정보를 바탕으로 D.I.S.(Diagnostic Intent Score)가 산출됩니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">이름 (필수)</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded text-white focus:border-cyan-500 outline-none transition duration-150"
                        required
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">이메일 (D.I.S. 검증에 사용)</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded text-white focus:border-cyan-500 outline-none transition duration-150"
                        required
                    />
                </div>

                {/* Risk Description Field */}
                <div>
                    <label htmlFor="riskDescription" className="block text-sm font-medium text-gray-300 mb-2">시스템 구조적 결함 설명 (최소 50자 필수)</label>
                    <textarea 
                        id="riskDescription" 
                        name="riskDescription" 
                        rows={4} 
                        value={formData.riskDescription} 
                        onChange={handleChange}
                        placeholder="예: 데이터 흐름이 특정 시점(T+1:30)에 정체되어, 후속 프로세스에서 예측 불가능한 오류가 발생하고 있습니다."
                        className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded text-white focus:border-cyan-500 outline-none transition duration-150 resize-y"
                        required
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={formData.isLoading}
                    className={`w-full p-3 text-lg font-bold rounded transition duration-300 ${
                        formData.isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#FF4081] hover:bg-[#ff6699] shadow-xl shadow-[#ff4081]/30'
                    } text-white`}
                >
                    {formData.isLoading ? '진단 중... (데이터 전송)' : 'D.I.S. 산출 및 진단 요청'}
                </button>

                {/* Message Display */}
                {formData.message && (
                    <p className={`text-center mt-4 p-2 rounded ${formData.message.startsWith('✅') ? 'bg-green-900/50 text-green-300' : formData.message.startsWith('❌') ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}`}>
                        {formData.message}
                    </p>
                )}
            </form>
        </div>
    );
}