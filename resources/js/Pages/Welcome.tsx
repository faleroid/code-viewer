import { Head, Link, usePage } from '@inertiajs/react';

interface WelcomeProps {
    canLogin?: boolean;
    canRegister?: boolean;
    laravelVersion: string;
    phpVersion: string;
}

export default function Welcome({
    canLogin,
    canRegister,
    laravelVersion,
    phpVersion,
}: WelcomeProps) {
    const { auth } = usePage().props as any;

    const handleImageError = () => {
        document.getElementById('screenshot-container')?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document.getElementById('docs-card-content')?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <img
                    id="background"
                    className="absolute -left-20 top-0 max-w-[877px]"
                    src="https://laravel.com/assets/img/welcome/background.svg"
                    alt="Background"
                />
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <span className="text-2xl font-bold text-sky-600">LabCode Viewer</span>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                            >
                                                Register
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-zinc-900 text-center space-y-4">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                    Selamat Datang di LabCode Viewer
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                    Platform sistem manajemen praktikum & peninjauan kode tugas mahasiswa terintegrasi.
                                </p>
                                <div className="pt-4 flex justify-center gap-4">
                                    <Link
                                        href={route('login')}
                                        className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
                                    >
                                        Masuk ke Dashboard
                                    </Link>
                                </div>
                            </div>
                        </main>

                        <footer className="py-16 text-center text-sm text-black dark:text-white/70">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
