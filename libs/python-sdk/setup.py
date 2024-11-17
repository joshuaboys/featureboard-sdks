from setuptools import setup, find_packages

setup(
    name='featureboard-python-sdk',
    version='0.1.0',
    description='FeatureBoard SDK for Python applications',
    long_description='The FeatureBoard Python SDK is planned to be published to PyPI. In the meantime, you can install it directly from the GitHub repository.',
    long_description_content_type='text/markdown',
    author='FeatureBoard',
    author_email='support@featureboard.app',
    url='https://github.com/arkahna/featureboard-sdks',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'requests>=2.25.1',
    ],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
    ],
)
