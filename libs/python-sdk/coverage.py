import coverage

def start_coverage():
    """
    Start the coverage measurement.
    """
    cov = coverage.Coverage()
    cov.start()
    return cov

def stop_coverage(cov):
    """
    Stop the coverage measurement and save the report.
    
    :param cov: The coverage instance.
    """
    cov.stop()
    cov.save()

def report_coverage(cov, report_type='html', report_dir='coverage_report'):
    """
    Generate the coverage report.
    
    :param cov: The coverage instance.
    :param report_type: The type of report to generate ('html', 'xml', 'json').
    :param report_dir: The directory to save the report.
    """
    if report_type == 'html':
        cov.html_report(directory=report_dir)
    elif report_type == 'xml':
        cov.xml_report(outfile=f'{report_dir}/coverage.xml')
    elif report_type == 'json':
        cov.json_report(outfile=f'{report_dir}/coverage.json')
    else:
        raise ValueError(f'Unsupported report type: {report_type}')
